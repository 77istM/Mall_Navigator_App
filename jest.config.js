module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/testModules/**/*.test.js', '**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^expo/virtual/env$': '<rootDir>/test/mocks/expoVirtualEnv.js',
  },
  collectCoverageFrom: [
    'constants/**/*.js',
    'hooks/**/*.js',
    'utils/**/*.js',
  ],
};