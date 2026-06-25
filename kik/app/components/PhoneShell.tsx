import type { ReactNode } from "react"
import type { LayoutMode } from "../data/devicePresets"

type PhoneShellProps = {
  children: ReactNode
  layout?: LayoutMode
  listWidth?: number
}

export function PhoneShell({ children, layout = "phone", listWidth = 375 }: PhoneShellProps) {
  return (
    <div
      className="phone-shell"
      data-layout={layout}
      style={{ "--kik-list-width": `${listWidth}px` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
