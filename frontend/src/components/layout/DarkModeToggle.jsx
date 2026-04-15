import { Sun, Moon, Monitor, Smartphone, Tablet } from "lucide-react";
import SegmentedControl from "../ui/SegmentedControl";
import { text } from "../../resources";
import { getDeviceType } from "../../utils";

const deviceType = getDeviceType();

const systemIcon =
    deviceType === "mobile" ? (
        <Smartphone size={11} />
    ) : deviceType === "tablet" ? (
        <Tablet size={11} />
    ) : (
        <Monitor size={11} />
    );

const COLOR_MODE_OPTIONS = [
    {
        value: "light",
        icon: <Sun size={11} />,
        text: text.colorModeLight,
    },
    {
        value: "dark",
        icon: <Moon size={11} />,
        text: text.colorModeDark,
    },
    {
        value: "system",
        icon: systemIcon,
        text: text.colorModeSystem,
    },
];

export default function DarkModeToggle({
    colorMode,
    onColorModeChange,
    showIcon = true,
    showText = false,
}) {
    return (
        <SegmentedControl
            options={COLOR_MODE_OPTIONS}
            value={colorMode}
            onChange={onColorModeChange}
            ariaLabel={text.darkModeToggleLabel}
            showIcon={showIcon}
            showText={showText}
        />
    );
}
