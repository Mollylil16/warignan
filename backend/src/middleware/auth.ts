import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload as LibJwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from './errorHandler.js';
import type { Role } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Token manquant'));
  }
  const token = h.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as LibJwtPayload & {
      role?: Role;
    };
    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      decoded.role === undefined
    ) {
      return next(new HttpError(401, 'Token invalide'));
    }
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    next(new HttpError(401, 'Token invalide ou expiré'));
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Non authentifié'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Droits insuffisants'));
    }
    next();
  };
}
