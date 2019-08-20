import { execSync } from 'child_process'
import { existsSync, rename,createReadStream, createWriteStream, readFileSync, mkdirSync, unlink, writeFileSync } from 'fs'
import { resolve } from 'path'
import pixelMatch from 'pixelmatch'
import { PNG } from 'pngjs'

// if (!existsSync(resolve('./tmp/screenshots'))) {
// 	mkdirSync(resolve('./tmp'))
// 	mkdirSync(resolve('tmp/screenshots'))
// }

// const SCREENSHOT_DIR = resolve('./tmp/screenshots')

const SCREENSHOT_OPTIONS = {
	timeout: 1000,
	killSignal: 'SIGKILL',
}


export const getDevicePlatform = () => {
	if (device){
		// detox
		return device.getPlatform()
	}
	// if (driver){
	// 	// appium
	// 	return driver.getCapabilities().getCapability("platformName")
	// }
	console.error('Platform target not detected, detox or appium not detected')
	return null
}

// /**
//  * Creates a screenshot based on android or iOS platform.
//  * @param componentPath
//  */
// export const takeScreenshot = (componentPath: string) => {
// 	const platform: string | null = getDevicePlatform() // appium or detox
// 	if (!platform){
// 		return
// 	}
//
// 	if (!existsSync(`${SCREENSHOT_DIR}/${componentPath}`)) {
// 		mkdirSync(`${SCREENSHOT_DIR}/${componentPath}`)
// 	}
// 	const screenshotFilename = `${SCREENSHOT_DIR}/${componentPath}/screenshot-${screenshotIndex++}.png`
// 	switch (platform) {
// 		case 'ios':
// 			execSync(
// 				`xcrun simctl io booted screenshot ${screenshotFilename}`,
// 				SCREENSHOT_OPTIONS,
// 			)
// 			break
// 		case 'android':
// 			execSync(`adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > ${screenshotFilename}
// `)
// 			break
// 		default:
// 			return console.warn(`Unsupported OS: ${platform}, screenshots disabled`)
// 	}
// }

/**
 * Creates a pixel diff image which highlights areas that do not match between two images
 * @param componentPath
 */
// export const pixelDiff = (componentPath: string, basePath: string, testPath: string) => {
// 	const TMP_PATH = `${SCREENSHOT_DIR}/${componentPath}`
// 	const img1 = PNG.sync.read(readFileSync(`${COMPONENT_PATH}/screenshot-0.png`))
// 	const img2 = PNG.sync.read(readFileSync(`${COMPONENT_PATH}/screenshot-1.png`))
// 	const { width, height } = img1
// 	const diff = new PNG({ width, height })
//
// 	pixelMatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 })
//
// 	writeFileSync(`${COMPONENT_PATH}/diff.png`, PNG.sync.write(diff))
// }

export const saveScreenshot = (directory: string, fileName: string) => {
	mkdirSync(resolve(directory))
}

interface Config {
	basePath: string,
	savePath: string
	tmpPath: string,
}

class Setup {
	constructor(tmpPath: string = 'tmp', savePath: string = 'screenshots', basePath: string = ''){
		this.config = this.createConfig(tmpPath, savePath, basePath)
	}
	config: Config

	createConfig(tmpPath: string, savePath: string, basePath: string): Config {
		if (!existsSync(resolve(basePath))) {
			mkdirSync(resolve(basePath))
		}
		if (!existsSync(resolve(basePath,savePath))){
			mkdirSync(resolve(basePath,savePath))
		}
		if (!existsSync(resolve(basePath,tmpPath))) {
			mkdirSync(resolve(basePath,tmpPath))
		}

		const baseURL = resolve(basePath)
		return {
			basePath: baseURL,
			savePath: resolve(basePath,savePath),
			tmpPath: resolve(basePath,tmpPath),
		}
	}

	/**
	 * Creates a screenshot based on android or iOS platform.
	 */
	createScreenshot = (identifier: string, subFolder: string, config: Config = this.config) => {
		const { savePath, tmpPath } = config
		const platform: string | null = getDevicePlatform() // appium or detox
		if (!platform || !tmpPath){
			return
		}

		if (!existsSync(resolve(tmpPath, subFolder))) {
			mkdirSync(resolve(tmpPath, subFolder))
		}
		const file = `${tmpPath}/${subFolder}/${identifier}.png`
		switch (platform) {
			case 'ios':
				execSync(
					`xcrun simctl io booted screenshot ${file}`,
					SCREENSHOT_OPTIONS,
				)
				break
			case 'android':
				execSync(`adb shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > ${file}
`)
				break
			default:
				return console.warn(`Unsupported OS: ${platform}, screenshots disabled`)
		}
	}

	/**
	 * Creates a pixel diff image which highlights areas that do not match between two images
	 * can override path using config
	 */
	pixelDiff = (name: string, subFolder: string, config: Config = this.config) => {
		const { savePath, tmpPath } = config
		const filename = `${name}.png`
		const getSavePath = () => resolve(savePath,subFolder,filename) // TODO make memoization fn
		const getTmpPath = () => resolve(tmpPath, subFolder, filename) // TODO make memoization fn

		if (!existsSync(getTmpPath())){
			return console.error('Temp file does not exist')
		}

		if (!existsSync(resolve(savePath,subFolder))) {
			mkdirSync(resolve(savePath,subFolder))
		}

		if (!existsSync(resolve(savePath,filename))){
			const readStream = createReadStream(getTmpPath());
			const writeStream = createWriteStream(getSavePath());

			readStream.on('error', () => console.log('error with read stream'));
			writeStream.on('error', () => console.log('written'));

			readStream.on('close', function () {
				unlink(getTmpPath(), () => console.log('unlinked old path'));
			});

			readStream.pipe(writeStream);
		}


		if (!existsSync(getSavePath())){
			rename(getTmpPath(), getSavePath(), function (err) {
				if (err) {
					if (err.code === 'EXDEV') {
						return console.error('Error EXDEV, looks like you are attempting to rename across partitions', err)
					} else {
						console.error('Error occurred while moving tempFile to screenshot directory', err)
					}
					return;
				}
			});
		}


		const tmpImage = PNG.sync.read(readFileSync(getTmpPath()))
		const saveImage = PNG.sync.read(readFileSync(getSavePath()))
		const { width, height } = saveImage
		const diff = new PNG({ width, height })

		pixelMatch(saveImage.data, tmpImage.data, diff.data, width, height, { threshold: 0.1 })

		writeFileSync(`${tmpPath}/${subFolder}/diff-${filename}`, PNG.sync.write(diff))
	}
}

export default Setup
