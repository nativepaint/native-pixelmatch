// var path = require('path');
// var uuid = require('node-uuid');
var chai = require('chai');
// var argv = Object.assign(require('minimist')(process.argv));
const {resolve} = require('path');

exports.config = {
  services: [['appium', {command: 'appium'}]],
  port: 4723,
  runner: 'local',
  specs: ['./__tests__/**/*.test.js'],
  capabilities: [
    {
      maxInstances: 1,
      browserName: '',
      appiumVersion: '1.13.0',
      platformName: 'Android',
      platformVersion: '10',
      deviceName: 'Nexus 6P API 29',
      app: './android/app/build/outputs/apk/debug/app-debug.apk',
      automationName: 'UiAutomator2',
    },
  ],
  sync: true,

  logLevel: 'trace',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  //   before: function(capabilities, specs) {
  //     global.expect = chai.expect;
  //     console.log('running test on iOS');
  //     const deviceId = JSON.parse(capabilities.processArguments).args[0];
  //     console.log(
  //       'using device id from processArguments capability - ' + deviceId,
  //     );
  //     browser.testDeviceId = deviceId;
  //   },
};
