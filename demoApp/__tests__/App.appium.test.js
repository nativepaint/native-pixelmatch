const wd = require('wd');
var expect = require('chai').expect;

const PORT = 4723;
// const driver = wd.promiseChainRemote('localhost', PORT);

describe('Simple App testing', () => {
  // Adding time out to make sure the app is load prior to test is run
  beforeEach(() => {
    $('~app-root').waitForDisplayed(11000, false);
  });

  it('Valid Login Test', async => {
    $('~username').setValue('test');
    $('~password').setValue('123456');

    $('~login').click();

    $('~loginstatus').waitForDisplayed(11000);
    driver.pause(500);
    const status = $('~loginstatus').getText();
    expect(status).to.equal('success');
  });

  it('Invalid Login Test', async => {
    driver.launchApp();
    $('~username').setValue('test');
    $('~password').setValue('12345');

    $('~login').click();

    $('~loginstatus').waitForDisplayed(11000);
    const status = $('~loginstatus').getText();
    expect(status).to.equal('fail');
  });
});
