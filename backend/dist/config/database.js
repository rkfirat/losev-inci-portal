"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Force load env
const envPath = path_1.default.resolve(__dirname, '../../.env');
const result = dotenv_1.default.config({ path: envPath });
if (!process.env.DATABASE_URL) {
    // If dotenv didn't work for some reason, manually parse
    const fs = require('fs');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (match) {
        process.env.DATABASE_URL = match[1];
    }
}
exports.prisma = new client_1.PrismaClient();
exports.default = exports.prisma;
