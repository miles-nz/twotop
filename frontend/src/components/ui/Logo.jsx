import { text } from "../../resources";
import AnimatedColon from "./AnimatedColon";

function Logo({
    size = 500,
    showIcon = true,
    showText = true,
    fontSize = "4xl",
    colonOverlap = false,
    middleColon = true,
    disableAnimation = false,
}) {
    const fontSizeClass =
        {
            xl: "text-xl",
            "2xl": "text-2xl",
            "3xl": "text-3xl",
            "4xl": "text-4xl",
        }[fontSize] ?? "text-4xl";
    return (
        <div className="flex items-center gap-2">
            {showIcon && (
                <div
                    className="relative"
                    style={{
                        width: size,
                        height: size,
                        minWidth: size,
                        minHeight: size,
                    }}
                >
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 500 500"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g
                            transform="translate(-55, -45) scale(1.2)"
                            style={{ isolation: "isolate" }}
                        >
                            {/* FORK */}
                            <g
                                transform="translate(32, 10) scale(1.5, 1)"
                                fill="var(--color-logo-cutlery)"
                                stroke="var(--color-logo-cutlery)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M51,211 Q47,211 51,300 Q60,405 50,410 Q45,415 40,410 Q30,405 39,300 Q43,211 39,211 L51,211 Z" />
                                <path d="M27,175 Q28,200 33,204 T39,211 L51,211 Q52,208 57,204 Q62,200 63,175 Z" />
                                <path d="M27,175 L29,70 Q30,70 31,70 L33,160 Q35,163 37,160 L39,70 Q40,70 41,70 L43,160 Q45,163 47,160 L49,70 Q50,70 51,70 L53,160 Q55,163 57,160 L59,70 Q60,70 61,70 L63,175" />
                            </g>

                            {/* KNIFE */}
                            <g
                                transform="translate(330, 15) scale(1.5, 1)"
                                fill="var(--color-logo-cutlery)"
                                stroke="var(--color-logo-cutlery)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M51,235 Q50,235 51,300 Q61,405 50,410 Q45,415 40,410 Q29,405 39,300 Q40,235 39,235 L51,235" />
                                <path d="M52,235 L53,230 L53,110 L53,60 Q52,50 46,50 Q38,50 33,130 Q30,200 35,232.5 L39,235 L52,235 Z" />
                            </g>

                            {/* Top circle: primary colour */}
                            <g style={{ isolation: "isolate" }}>
                                <circle
                                    cx="250"
                                    cy="180"
                                    r="110"
                                    fill="white"
                                    style={{
                                        opacity:
                                            size <= 200
                                                ? "var(--logo-ring-opacity, 0)"
                                                : "0",
                                    }}
                                />

                                <circle
                                    cx="250"
                                    cy="180"
                                    r="100"
                                    fill="var(--color-logo-primary-dark, #1a1538)"
                                />
                                <circle
                                    cx="250"
                                    cy="180"
                                    r="86"
                                    fill="var(--color-logo-primary)"
                                />
                            </g>

                            {/* Bottom circle: secondary colour */}
                            <g
                                style={{
                                    isolation: "isolate",
                                    mixBlendMode: "soft-light",
                                }}
                            >
                                <circle
                                    cx="250"
                                    cy="300"
                                    r="110"
                                    fill="white"
                                    style={{
                                        opacity:
                                            size <= 200
                                                ? "var(--logo-ring-opacity, 0)"
                                                : "0",
                                    }}
                                />

                                <circle
                                    cx="250"
                                    cy="300"
                                    r="100"
                                    fill="var(--color-logo-secondary-dark, #6b0100)"
                                />
                                <circle
                                    cx="250"
                                    cy="300"
                                    r="86"
                                    fill="var(--color-logo-secondary)"
                                />
                            </g>
                        </g>
                    </svg>
                </div>
            )}

            {showText && (
                <h2
                    className={`${fontSizeClass} text-text-dark select-none`}
                    style={{
                        fontFamily: "var(--font-logo)",
                        fontWeight: "550",
                        textShadow: "0 4px 12px rgba(0,0,0,0.18)",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                    }}
                >
                    <span
                        style={{ display: "inline-flex", alignItems: "center" }}
                    >
                        {text.appName1}
                        {middleColon ? (
                            <span
                                className="mx-0.5 font-bold"
                                style={{
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                }}
                            >
                                <AnimatedColon
                                    size="1.25em"
                                    overlap={colonOverlap}
                                    disableAnimation={disableAnimation}
                                    duration={1250}
                                />
                            </span>
                        ) : (
                            <span className="mx-0.5"> </span>
                        )}
                        {text.appName2}
                    </span>
                </h2>
            )}
        </div>
    );
}

export default Logo;
