import { themes } from "../../themes";
import { STAR_PATH } from "../../resources";

function ThemePreview({ themeId, isActive, onClick, isDarkMode }) {
    const modeThemes = isDarkMode ? themes.dark : themes.light;
    const theme = modeThemes[themeId] || modeThemes["default-theme"];

    const surface50 = theme["--color-surface-50"];
    const surface200 = theme["--color-surface-200"];
    const primaryAccent = theme["--color-primary-400"];
    const secondary = theme["--color-secondary-400"];
    const textDark = theme["--color-text-dark"];
    const textLight = theme["--color-text-light"];
    const textMid = theme["--color-text-mid"];
    const starsCount = Math.random() > 0.5 ? 3 : 4; // Randomly assign 3 or 4 stars for visual interest
    const size = 90;

    const words = themeId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

    const title = words[0];
    const subtitle = words[1] ?? words[0];

    return (
        <button
            onClick={onClick}
            className="focus:outline-none group"
            aria-pressed={isActive}
            aria-label={themeId}
        >
            <div
                className={`rounded-xl overflow-hidden transition-all duration-150 ${
                    isActive ? "scale-110" : "group-hover:scale-102"
                }`}
                style={{
                    width: size,
                    height: size,
                    outline: isActive
                        ? `2px solid ${secondary}`
                        : `1px solid ${surface200}`,
                    outlineOffset: isActive ? "-1px" : "0px",
                    transformOrigin: "center",
                    willChange: "transform",
                }}
            >
                <div
                    style={{
                        width: size,
                        height: size,
                        background: surface50,
                        borderLeft: `3px solid ${secondary}`,
                        padding: "8px 8px 8px 7px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                >
                    {/* Title -- first word */}
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: textDark,
                            opacity: 0.85,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                            lineHeight: 1.2,
                        }}
                    >
                        {title}
                    </div>
                    {/* Subtitle -- second word */}
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 400,
                            color: textLight,
                            opacity: 0.7,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                            lineHeight: 1.2,
                        }}
                    >
                        {subtitle}
                    </div>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <svg
                                key={i}
                                width={8}
                                height={8}
                                viewBox="0 0 24 24"
                                fill={
                                    i <= starsCount ? primaryAccent : surface200
                                }
                            >
                                <path d={STAR_PATH} />
                            </svg>
                        ))}
                    </div>
                    {/* Body lines */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <div
                            style={{
                                height: 4,
                                width: "90%",
                                borderRadius: 2,
                                background: textMid,
                                opacity: 0.4,
                            }}
                        />
                        <div
                            style={{
                                height: 4,
                                width: "65%",
                                borderRadius: 2,
                                background: textMid,
                                opacity: 0.4,
                            }}
                        />
                    </div>
                </div>
            </div>
        </button>
    );
}

export default ThemePreview;
