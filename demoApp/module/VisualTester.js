import { execSync } from 'child_process';
import { existsSync, createReadStream, createWriteStream, readFileSync, mkdirSync, unlink, writeFileSync } from 'fs';
import { resolve } from 'path';
import pixelMatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { getDevicePlatform, warningMessageWrapper } from './helpers';
/**
 * Requires Setup to have initialized the app
 */
export default class VisualTester {
    constructor(config) {
        /**
         * Creates a screenshot based on android or iOS platform.
         * Supports config overrides and defaults to initialized config
         */
        this.createScreenshot = (identifier, subDir = '', config = this.config) => {
            const { paths: { savePath, tmpPath }, runner } = config;
            const platform = getDevicePlatform(runner); // appium or detox
            if (!platform || !tmpPath) {
                return;
            }
            if (!existsSync(resolve(tmpPath, subDir))) {
                mkdirSync(resolve(tmpPath, subDir));
            }
            const file = resolve(tmpPath, subDir, `${identifier}.png`);
            switch (platform) {
                case 'ios':
                    execSync(`xcrun simctl io booted screenshot ${file}`, this.config.screenshotOptions);
                    break;
                case 'android':
                    execSync(`adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > ${file}
`);
                    break;
                default:
                    return console.warn(`Unsupported OS: ${platform}, screenshots disabled`);
            }
        };
        /**
         * Creates a pixel diff image which highlights areas that do not match between two images
         * can override path using config
         */
        this.pixelDiff = (name, subDir = '', config = this.config) => {
            const { savePath, tmpPath } = config.paths;
            const filename = `${name}.png`;
            const getSavePath = () => resolve(savePath, subDir, filename); // TODO make memoization fn
            const getTmpPath = () => resolve(tmpPath, subDir, filename); // TODO make memoization fn
            if (!existsSync(getTmpPath())) {
                return console.error('Temp file does not exist');
            }
            if (!existsSync(resolve(savePath, subDir))) {
                mkdirSync(resolve(savePath, subDir));
            }
            if (!existsSync(getSavePath())) {
                const readStream = createReadStream(getTmpPath());
                const writeStream = createWriteStream(getSavePath());
                readStream.on('error', () => console.log('error with read stream'));
                writeStream.on('error', () => console.log('written'));
                readStream.on('close', function () {
                    unlink(getTmpPath(), () => console.log('unlinked old path'));
                });
                console.log(`Success: Moved ${filename} to saved folder`);
                readStream.pipe(writeStream);
                return;
            }
            const tmpImage = PNG.sync.read(readFileSync(getTmpPath()));
            const saveImage = PNG.sync.read(readFileSync(getSavePath()));
            const { width, height } = saveImage;
            const diff = new PNG({ width, height });
            pixelMatch(saveImage.data, tmpImage.data, diff.data, width, height, {
                threshold: 0.1
            });
            writeFileSync(resolve(tmpPath, subDir, `diff-${filename}`), PNG.sync.write(diff));
        };
        if (!config) {
            warningMessageWrapper(`
      Failed to provide a configuration, please either share a single config or initialize a new setup.
      Example: const firstVRTest = new VisualTester(new Setup(DEFAULT_CONFIG))`);
        }
        this.config = config;
    }
}
