import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CirclePlus,
  EllipsisVertical,
  Handshake,
  Heart,
  House,
  Mail,
  Menu,
  Pencil,
  Send,
  Shield,
  UserRound,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react"

type WallapopIconName =
  | "arrow_left"
  | "burguer_menu"
  | "chevron_right"
  | "cross"
  | "ellipsis_horizontal"
  | "paper_plane"
  | "shield"
  | "edit"
  | "home"
  | "heart"
  | "plus"
  | "mail"
  | "user"
  | "bookmark"
  | "deal"
  | "calendar"
  | "double_check"

type WallapopIconSize = "small" | "medium" | "large" | number

type WallapopIconProps = Omit<LucideProps, "size"> & {
  name: WallapopIconName
  size?: WallapopIconSize
}

const wallapopIconMap: Record<WallapopIconName, LucideIcon> = {
  arrow_left: ArrowLeft,
  burguer_menu: Menu,
  chevron_right: ChevronRight,
  cross: X,
  ellipsis_horizontal: EllipsisVertical,
  paper_plane: Send,
  shield: Shield,
  edit: Pencil,
  home: House,
  heart: Heart,
  plus: CirclePlus,
  mail: Mail,
  user: UserRound,
  bookmark: Bookmark,
  deal: Handshake,
  calendar: CalendarDays,
  double_check: CheckCheck,
}

const iconSizeMap: Record<Exclude<WallapopIconSize, number>, number> = {
  small: 16,
  medium: 24,
  large: 24,
}

function WallapopIcon({
  name,
  size = "medium",
  strokeWidth = 1.8,
  ...props
}: WallapopIconProps) {
  const Icon = wallapopIconMap[name]
  const resolvedSize = typeof size === "number" ? size : iconSizeMap[size]

  return (
    <Icon
      size={resolvedSize}
      strokeWidth={strokeWidth}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    />
  )
}

export { WallapopIcon, type WallapopIconName, type WallapopIconSize }
