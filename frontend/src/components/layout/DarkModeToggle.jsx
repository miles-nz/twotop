import { Sun, Moon, Monitor, Smartphone, Tablet } from "lucide-react";
import SegmentedControl from "../ui/SegmentedControl";
import { text } from "../../resources";
import { getDeviceType } from "../../utils";

const deviceType = getDeviceType();

const largeIconSize = 16;
const smallIconSize = 11;

export default function DarkModeToggle({
    colorMode,
    onColorModeChange,
    iconOnly = false,
}) {
    const systemIcon =
        deviceType === "mobile" ? (
            <Smartphone size={iconOnly ? largeIconSize : smallIconSize} />
        ) : deviceType === "tablet" ? (
            <Tablet size={iconOnly ? largeIconSize : smallIconSize} />
        ) : (
            <Monitor size={iconOnly ? largeIconSize : smallIconSize} />
        );

    const COLOR_MODE_OPTIONS = [
        {
            value: "light",
            icon: <Sun size={iconOnly ? largeIconSize : smallIconSize} />,
            text: text.colorModeLight,
        },
        {
            value: "dark",
            icon: <Moon size={iconOnly ? largeIconSize : smallIconSize} />,
            text: text.colorModeDark,
        },
        {
            value: "system",
            icon: systemIcon,
            text: text.colorModeSystem,
        },
    ];

    return (
        <SegmentedControl
            options={COLOR_MODE_OPTIONS}
            value={colorMode}
            onChange={onColorModeChange}
            ariaLabel={text.darkModeToggleLabel}
            showIcon={true}
            showText={!iconOnly}
        />
    );
}
