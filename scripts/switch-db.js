import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, '../backend/prisma/schema.prisma');

const target = process.argv[2]?.toLowerCase();

if (target !== 'sqlite' && target !== 'postgresql') {
  console.error('Usage: node switch-db.js <sqlite|postgresql>');
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error(`Schema file not found at: ${schemaPath}`);
  process.exit(1);
}

try {
  let content = fs.readFileSync(schemaPath, 'utf8');

  // Regex to match the provider inside datasource db block
  const regex = /(datasource\s+db\s*{[\s\S]*?provider\s*=\s*")([^"]+)("\s*[\s\S]*?})/g;

  if (!regex.test(content)) {
    console.error('Could not find datasource db block with provider in schema.prisma');
    process.exit(1);
  }

  content = content.replace(regex, `$1${target}$3`);
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log(`Successfully switched database provider to "${target}" in schema.prisma`);
} catch (error) {
  console.error('Error switching database provider:', error);
  process.exit(1);
}
