module.exports = {
  testEnvironment: 'node',
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  },
  testRegex: '([/\\\\])__tests__([/\\\\]).*\\.(.*)(test|spec)\\.(js|ts)$',
  // dist is the built files. we want to ignore the tests in it.
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
  ],
};
