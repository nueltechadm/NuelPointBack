/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',  
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@entities/(.*)$': '<rootDir>/src/core/entities/$1',
    '^@contracts/(.*)$': '<rootDir>/src/core/abstractions/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@non-core-contracts/(.*)$': '<rootDir>/src/services/abstractions/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@data-contracts/(.*)$': '<rootDir>/src/data/abstract/$1',
    '^@filters/(.*)$': '<rootDir>/src/filters/$1',
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',
    '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1'
  },
  testPathIgnorePatterns :
  [
    "./__tests__/classes",
    "./__tests__/utils" 
  ]
};