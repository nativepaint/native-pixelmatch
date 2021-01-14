interface Driver {
  getCapabilities: () => { getCapability: (capability: string) => string }
}
interface Device {
  getPlatform: () => 'ios' | 'android' | null
}

declare var device: Device
declare var driver: Driver

interface Global {
  device: Device
  driver: Driver
}

type TestRunner = 'appium' | 'detox'

interface Config {
  paths: {
    basePath: string // basePath resolved relative to initialized Controller file
    savePath: string
    tmpPath: string
  }
  runner: TestRunner
  screenshotOptions: {
    timeout: number
    killSignal: 'SIGKILL'
  }
}
