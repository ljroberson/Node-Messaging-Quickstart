export type DeviceId = "iphone-x" | "ipad-11" | "macbook-pro-16"

export type LayoutMode = "phone" | "split"

export type DevicePreset = {
  id: DeviceId
  name: string
  width: number
  height: number
  layout: LayoutMode
  listWidth: number
}

export const devicePresets: DevicePreset[] = [
  {
    id: "iphone-x",
    name: "iPhone X",
    width: 375,
    height: 812,
    layout: "phone",
    listWidth: 375,
  },
  {
    id: "ipad-11",
    name: 'iPad 11"',
    width: 834,
    height: 1194,
    layout: "split",
    listWidth: 320,
  },
  {
    id: "macbook-pro-16",
    name: 'MacBook Pro 16"',
    width: 1400,
    height: 900,
    layout: "split",
    listWidth: 380,
  },
]

export const defaultDeviceId: DeviceId = "iphone-x"

export function getDevicePreset(id: DeviceId): DevicePreset {
  return devicePresets.find((preset) => preset.id === id) ?? devicePresets[0]
}
