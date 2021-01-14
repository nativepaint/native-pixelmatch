export const SCREENSHOT_DEFAULT_OPTIONS = {
  timeout: 1000,
  killSignal: 'SIGKILL'
}

export const DEFAULT_CONFIG = {
  paths: {
    basePath: '__test__vrt',
    savePath: 'shots',
    tmpPath: 'temp'
  },
  runner: 'detox',
  screenshotOptions: SCREENSHOT_DEFAULT_OPTIONS
}
