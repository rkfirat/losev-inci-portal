import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Force load env
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  // If dotenv didn't work for some reason, manually parse
  const fs = require('fs');
  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
  if (match) {
    process.env.DATABASE_URL = match[1];
  }
}

export const prisma = new PrismaClient();

export default prisma;
