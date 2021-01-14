import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { DEFAULT_CONFIG } from './config';
export default class Setup {
    constructor(config) {
        this.config = Object.assign(DEFAULT_CONFIG, config);
    }
    get config() {
        return this.config;
    }
    set config(config) {
        const { paths: { tmpPath, savePath, basePath }, runner } = config;
        if (!runner) {
            throw new Error('Error: Test Runner not provided, please choose appium or detox');
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
        this.config = Object.assign(config, {
            paths: {
                basePath: resolve(basePath),
                savePath: resolve(basePath, savePath),
                tmpPath: resolve(basePath, tmpPath)
            }
        });
    }
}
