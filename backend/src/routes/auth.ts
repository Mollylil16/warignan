import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(120),
});

// Mode email : vendeuse, admin, clients
const loginByEmailSchema = z.object({
  /** E-mail complet ou identifiant court seed (ex. `warignan` → `warignan@warignan.shop`). */
  email: z.string().min(1).max(200),
  password: z.string().min(1),
});

// Mode nom d'utilisateur : livreurs uniquement
const loginByUsernameSchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1),
});

const loginSchema = z.union([loginByUsernameSchema, loginByEmailSchema]);

function resolveLoginEmail(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (!t) return t;
  if (t.includes('@')) return t;
  return `${t}@warignan.shop`;
}

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw new HttpError(409, 'Email déjà utilisé');
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        displayName: body.displayName,
        role: 'client',
      },
    });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    // Mode connexion par nom d'utilisateur (livreurs)
    if ('username' in body) {
      const user = await prisma.user.findFirst({
        where: { displayName: body.username, role: 'livreur' },
      });
      if (!user) throw new HttpError(401, 'Identifiants incorrects');
      const ok = await bcrypt.compare(body.password, user.passwordHash);
      if (!ok) throw new HttpError(401, 'Identifiants incorrects');
      const token = signToken(user);
      // L'email interne @warignan.local n'est jamais retourné
      return res.json({
        token,
        user: { id: user.id, role: user.role, displayName: user.displayName, phone: user.phone ?? null },
      });
    }

    // Mode connexion par email (vendeuse, admin, clients)
    const email = resolveLoginEmail(body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, 'Identifiants invalides');
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Identifiants invalides');
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, role: true, displayName: true, phone: true, createdAt: true },
    });
    if (!user) throw new HttpError(404, 'Utilisateur introuvable');
    res.json({
      id: user.id,
      // L'email interne @warignan.local n'est pas exposé pour les livreurs
      ...(user.role !== 'livreur' ? { email: user.email } : {}),
      role: user.role,
      displayName: user.displayName,
      phone: user.phone ?? null,
      createdAt: user.createdAt,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
