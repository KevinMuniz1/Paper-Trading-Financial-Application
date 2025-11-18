module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
  projects: [
    {
      displayName: 'website',
      testMatch: ['**/tests/website/**/*.test.js'],
    },
    {
      displayName: 'mobile',
      testMatch: ['**/tests/mobile/**/*.test.js'],
    }
  ]
};