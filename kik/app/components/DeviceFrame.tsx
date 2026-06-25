"use client"

import { useEffect, useState, type ReactNode } from "react"
import type { DevicePreset } from "../data/devicePresets"
import { DeviceSelector } from "./DeviceSelector"
import type { DeviceId } from "../data/devicePresets"

type DeviceFrameProps = {
  device: DevicePreset
  deviceId: DeviceId
  onDeviceChange: (deviceId: DeviceId) => void
  children: ReactNode
}

export function DeviceFrame({ device, deviceId, onDeviceChange, children }: DeviceFrameProps) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      const chromeWidth = 280
      const verticalPadding = 48
      const horizontalPadding = 48

      const availableWidth = window.innerWidth - chromeWidth - horizontalPadding
      const availableHeight = window.innerHeight - verticalPadding

      const widthScale = availableWidth / device.width
      const heightScale = availableHeight / device.height

      setScale(Math.min(1, widthScale, heightScale))
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [device.width, device.height])

  return (
    <div className="flex min-h-dvh bg-zinc-200">
      <aside className="flex w-[260px] shrink-0 flex-col gap-4 border-r border-zinc-300 bg-zinc-100 p-5">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Kik Preview</h1>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Choose a device to resize the mock messenger. Incoming SMS appears in the Lauren
            Roberson thread.
          </p>
        </div>
        <DeviceSelector value={deviceId} onChange={onDeviceChange} />
        <div className="mt-auto rounded-lg bg-white p-3 text-xs text-zinc-500">
          <p className="font-medium text-zinc-700">Live SMS</p>
          <p className="mt-1">Messages to your FreeClimb number poll every 3 seconds.</p>
        </div>
      </aside>

      <div className="flex flex-1 items-center justify-center overflow-auto p-6">
        <div
          style={{
            width: device.width,
            height: device.height,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            className="device-shell"
            style={{
              width: device.width,
              height: device.height,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
