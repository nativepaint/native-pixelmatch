import { execSync } from "child_process";
import {
  existsSync,
  rename,
  createReadStream,
  createWriteStream,
  readFileSync,
  mkdirSync,
  unlink,
  writeFileSync
} from "fs";
import { resolve } from "path";
import pixelMatch from "pixelmatch";
import { PNG } from "pngjs";

type TestRunner = "appium" | "detox";

const SCREENSHOT_OPTIONS = {
  timeout: 1000,
  killSignal: "SIGKILL"
};

// TODO add better way to detect android vs ios without pulling in Appium/Detox globals
export const getDevicePlatform = (testRunner: TestRunner) => {
  if (testRunner === "appium") {
    // appium
    return driver.getCapabilities().getCapability("platformName");
  }
  if (testRunner === "detox") {
    // detox
    return device.getPlatform();
  }
  console.error("Platform target not detected, detox or appium not detected");
  return null;
};

export const saveScreenshot = (directory: string, fileName: string) => {
  mkdirSync(resolve(directory));
};

interface Config {
  basePath: string;
  savePath: string;
  tmpPath: string;
  testRunner: TestRunner;
}

class Setup {
  constructor(
    tmpPath: string = "tmp",
    savePath: string = "screenshots",
    basePath: string = "",
    testRunner: TestRunner
  ) {
    this.config = this.createConfig(tmpPath, savePath, basePath, testRunner);
  }
  config: Config;

  createConfig(
    tmpPath: string,
    savePath: string,
    basePath: string,
    testRunner: TestRunner
  ): Config {
    if (!testRunner) {
      throw new Error(
        "Error: Test Runner not provided, please choose appium or detox"
      );
    }
    if (!existsSync(resolve(basePath))) {
      mkdirSync(resolve(basePath));
    }
    if (!existsSync(resolve(basePath, savePath))) {
      mkdirSync(resolve(basePath, savePath));
    }
    if (!existsSync(resolve(basePath, tmpPath))) {
      mkdirSync(resolve(basePath, tmpPath));
    }

    const baseURL = resolve(basePath);
    return {
      basePath: baseURL,
      savePath: resolve(basePath, savePath),
      testRunner,
      tmpPath: resolve(basePath, tmpPath)
    };
  }

  /**
   * Creates a screenshot based on android or iOS platform.
   */
  createScreenshot = (
    identifier: string,
    subDir: string = "",
    config: Config = this.config
  ) => {
    const { savePath, tmpPath, testRunner } = config;
    const platform: string | null = getDevicePlatform(testRunner); // appium or detox
    if (!platform || !tmpPath) {
      return;
    }

    if (!existsSync(resolve(tmpPath, subDir))) {
      mkdirSync(resolve(tmpPath, subDir));
    }
    const file = resolve(tmpPath, subDir, `${identifier}.png`);
    switch (platform) {
      case "ios":
        execSync(
          `xcrun simctl io booted screenshot ${file}`,
          SCREENSHOT_OPTIONS
        );
        break;
      case "android":
        execSync(`adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > ${file}
`);
        break;
      default:
        return console.warn(
          `Unsupported OS: ${platform}, screenshots disabled`
        );
    }
  };

  /**
   * Creates a pixel diff image which highlights areas that do not match between two images
   * can override path using config
   */
  pixelDiff = (
    name: string,
    subDir: string = "",
    config: Config = this.config
  ) => {
    const { savePath, tmpPath } = config;
    const filename = `${name}.png`;
    const getSavePath = () => resolve(savePath, subDir, filename); // TODO make memoization fn
    const getTmpPath = () => resolve(tmpPath, subDir, filename); // TODO make memoization fn

    if (!existsSync(getTmpPath())) {
      return console.error("Temp file does not exist");
    }

    if (!existsSync(resolve(savePath, subDir))) {
      mkdirSync(resolve(savePath, subDir));
    }

    if (!existsSync(getSavePath())) {
      const readStream = createReadStream(getTmpPath());
      const writeStream = createWriteStream(getSavePath());

      readStream.on("error", () => console.log("error with read stream"));
      writeStream.on("error", () => console.log("written"));

      readStream.on("close", function() {
        unlink(getTmpPath(), () => console.log("unlinked old path"));
      });

      console.log(`Success: Moved ${filename} to saved folder`)
      readStream.pipe(writeStream);
      return
    }

    const tmpImage = PNG.sync.read(readFileSync(getTmpPath()));
    const saveImage = PNG.sync.read(readFileSync(getSavePath()));
    const { width, height } = saveImage;
    const diff = new PNG({ width, height });

    pixelMatch(saveImage.data, tmpImage.data, diff.data, width, height, {
      threshold: 0.1
    });

    writeFileSync(
      resolve(tmpPath, subDir, `diff-${filename}`),
      PNG.sync.write(diff)
    );
  };
}

export default Setup;
