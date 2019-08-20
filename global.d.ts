interface Driver {
  getCapabilities: () => { getCapability: (capability: string) => string}
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
