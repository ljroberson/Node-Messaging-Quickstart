import type { DeviceId } from "../data/devicePresets"
import { devicePresets } from "../data/devicePresets"

type DeviceSelectorProps = {
  value: DeviceId
  onChange: (deviceId: DeviceId) => void
}

export function DeviceSelector({ value, onChange }: DeviceSelectorProps) {
  const selected = devicePresets.find((preset) => preset.id === value) ?? devicePresets[0]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <label htmlFor="device-select" className="block text-sm font-semibold text-zinc-800">
        Preview device
      </label>
      <p className="mt-1 text-xs text-zinc-500">
        {selected.width} × {selected.height}px ·{" "}
        {selected.layout === "phone" ? "Phone layout" : "Split layout"}
      </p>
      <select
        id="device-select"
        value={value}
        onChange={(event) => onChange(event.target.value as DeviceId)}
        className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-kik-blue"
      >
        {devicePresets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
    </div>
  )
}
