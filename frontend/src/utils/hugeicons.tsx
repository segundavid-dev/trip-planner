import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import Calendar01IconSvg from "@hugeicons/core-free-icons/Calendar01Icon";
import Clock01IconSvg from "@hugeicons/core-free-icons/Clock01Icon";
import Coffee01IconSvg from "@hugeicons/core-free-icons/Coffee01Icon";
import FuelIconSvg from "@hugeicons/core-free-icons/FuelIcon";
import Home01IconSvg from "@hugeicons/core-free-icons/Home01Icon";
import MoonIconSvg from "@hugeicons/core-free-icons/MoonIcon";
import PackageIconSvg from "@hugeicons/core-free-icons/PackageIcon";
import RoadIconSvg from "@hugeicons/core-free-icons/RoadIcon";
import Route01IconSvg from "@hugeicons/core-free-icons/Route01Icon";
import Timer01IconSvg from "@hugeicons/core-free-icons/Timer01Icon";
import TruckIconSvg from "@hugeicons/core-free-icons/TruckIcon";
import WarehouseIconSvg from "@hugeicons/core-free-icons/WarehouseIcon";

type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">;

function withHugeIcon(icon: ComponentProps<typeof HugeiconsIcon>["icon"]) {
  return function HugeIcon(props: IconProps) {
    return <HugeiconsIcon icon={icon} {...props} />;
  };
}

export const TruckIcon = withHugeIcon(TruckIconSvg);
export const Route01Icon = withHugeIcon(Route01IconSvg);
export const Home01Icon = withHugeIcon(Home01IconSvg);
export const WarehouseIcon = withHugeIcon(WarehouseIconSvg);
export const PackageIcon = withHugeIcon(PackageIconSvg);
export const Clock01Icon = withHugeIcon(Clock01IconSvg);
export const Calendar01Icon = withHugeIcon(Calendar01IconSvg);
export const Coffee01Icon = withHugeIcon(Coffee01IconSvg);
export const FuelIcon = withHugeIcon(FuelIconSvg);
export const RoadIcon = withHugeIcon(RoadIconSvg);
export const Timer01Icon = withHugeIcon(Timer01IconSvg);
export const MoonIcon = withHugeIcon(MoonIconSvg);
