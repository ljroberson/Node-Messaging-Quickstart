import { getInitials } from "../data/mockKik"

type AvatarProps = {
  displayName: string
  avatarColor: string
  avatarUrl?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
}

export function Avatar({
  displayName,
  avatarColor,
  avatarUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizeClass = sizeClasses[size]

  if (avatarUrl) {
    return (
      // Data URLs from user uploads; next/image is not used here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName}
        className={`avatar-circle object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <div
      className={`avatar-circle ${sizeClass} ${className}`}
      style={{ backgroundColor: avatarColor }}
    >
      {getInitials(displayName)}
    </div>
  )
}
