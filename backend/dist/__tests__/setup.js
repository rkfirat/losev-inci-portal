"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const database_1 = __importDefault(require("../config/database"));
jest.mock('../config/database', () => ({
    __esModule: true,
    default: (0, jest_mock_extended_1.mockDeep)(),
    prisma: (0, jest_mock_extended_1.mockDeep)(),
}));
// Redis Mock
jest.mock('../config/redis', () => {
    const RedisMock = require('redis-mock');
    const client = RedisMock.createClient();
    // Basic mock for ioredis-like methods if needed
    client.get = (key) => Promise.resolve(null);
    client.set = (key, val) => Promise.resolve('OK');
    client.del = (key) => Promise.resolve(1);
    return {
        __esModule: true,
        default: client,
    };
});
exports.prismaMock = database_1.default;
beforeEach(() => {
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
    // Default mocks for common operations
    exports.prismaMock.coalition.findMany.mockResolvedValue([]);
});
