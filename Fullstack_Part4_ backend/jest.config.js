// jest.config.js
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    testTimeout: 30000,
    // Handle open handles
    detectOpenHandles: true,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
  };