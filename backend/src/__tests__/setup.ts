import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../config/database';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
  prisma: mockDeep<PrismaClient>(),
}));

// Redis Mock
jest.mock('../config/redis', () => {
  const RedisMock = require('redis-mock');
  const client = RedisMock.createClient();
  
  // Basic mock for ioredis-like methods if needed
  client.get = (key: string) => Promise.resolve(null);
  client.set = (key: string, val: string) => Promise.resolve('OK');
  client.del = (key: string) => Promise.resolve(1);

  return {
    __esModule: true,
    default: client,
  };
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  // Default mocks for common operations
  prismaMock.coalition.findMany.mockResolvedValue([]);
});
