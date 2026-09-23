import {
  Code2,
  Laptop,
  Monitor,
  Mouse,
  Wifi,
  HardDrive,
  Wrench,
  Globe,
  GraduationCap,
  Smartphone,
  Cpu,
  ShieldCheck,
  Truck,
  MessageCircle,
  CreditCard,
  Zap,
  MapPin,
  Phone,
  Mail,
  User,
  Keyboard,
  FileSpreadsheet,
  BadgeCheck,
  Headphones,
  BatteryCharging,
  Plug,
  Usb,
  MemoryStick,
  Cable,
  Database,
  Package,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  // categories / products
  laptop: Laptop,
  desktop: Monitor,
  monitor: Monitor,
  mouse: Mouse,
  wifi: Wifi,
  storage: HardDrive,
  harddrive: HardDrive,
  components: MemoryStick,
  ram: MemoryStick,
  power: BatteryCharging,
  charger: Plug,
  powerbank: BatteryCharging,
  usb: Usb,
  flash: Usb,
  ssd: Database,
  cable: Cable,
  headphones: Headphones,
  package: Package,
  // services
  web: Globe,
  globe: Globe,
  mobile: Smartphone,
  software: Cpu,
  repair: Wrench,
  wrench: Wrench,
  learn: GraduationCap,
  graduation: GraduationCap,
  // value props
  shield: ShieldCheck,
  truck: Truck,
  chat: MessageCircle,
  card: CreditCard,
  verified: BadgeCheck,
  zap: Zap,
  // contact
  pin: MapPin,
  phone: Phone,
  mail: Mail,
  user: User,
  keyboard: Keyboard,
  office: FileSpreadsheet,
  code: Code2,
};

export function Icon({
  name,
  className,
  size,
  strokeWidth = 2,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Cmp = map[name] ?? Package;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} />;
}
