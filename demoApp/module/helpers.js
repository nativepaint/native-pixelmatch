import { mkdirSync } from 'fs';
import { resolve } from 'path';
/**
 * A TestRunner always needs to be expliciately defined
 * @description provides the method to query the device platform based on runner type
 */
export const getDevicePlatform = (runner) => {
    if (runner === 'appium') {
        // appium
        return driver.getCapabilities().getCapability('platformName');
    }
    if (runner === 'detox') {
        // detox
        return device.getPlatform();
    }
    console.error('Platform target not detected, detox or appium not detected');
    return null;
};
export const saveScreenshot = (directory, fileName) => {
    mkdirSync(resolve(directory));
};
export const warningMessageWrapper = (message) => {
    console.error(`
  <---- native-pixelmatch WARNING START ---->
  ${message}
  </---- native-pixelmatch WARNING END ---->
  `);
};
