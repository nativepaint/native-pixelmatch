const path = require('path');

module.exports = {
  services: ['appium'],
  port: 4723,
  runner: 'local',
  specs: ['./__tests__/**/*.test.js'],
  capabilities: [
    {
      automationName: 'XCUITest',
      browserName: 'iOS',
      platformName: 'iOS',
      platformVersion: '14',
      os_version: '14',
      appiumVersion: '1.13.0',
      device: 'iPhone 11',
      newCommandTimeout: 300,
      autoLaunch: false,
      // processArguments: '{ "args": ["' + uuid.v4() + '"] }',
      iosInstallPause: 8000,
      noReset: true,
      // xcodeConfigFile: path.resolve(`./signing.xcconfig`).replace(/\\/g, '/'),
    },
  ],

  maxInstances: 1,

  sync: true,

  logLevel: 'silent',

  coloredLogs: true,

  screenshotPath: 'screenshots/',

  baseUrl: 'http://localhost',

  waitforTimeout: 30000,

  connectionRetryTimeout: 900000,

  connectionRetryCount: 0,

  framework: 'mocha',

  mochaOpts: {
    ui: 'bdd',
    timeout: 3000000,
  },

  reporters: ['spec'],
};
