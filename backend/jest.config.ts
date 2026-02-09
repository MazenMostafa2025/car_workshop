import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
  },
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@docs/(.*)$': '<rootDir>/src/docs/$1',
  },
  collectCoverageFrom: ['src/modules/**/*.service.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
  clearMocks: true,
  restoreMocks: true,
};

export default config;
