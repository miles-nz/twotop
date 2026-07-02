export default function ReviewIcon({ size = 24 }) {
    const starSize = size * 0.58;
    const startX = (size - starSize) / 2;
    const lineWidth = starSize * 1.6;
    const lineStartX = (size - lineWidth) / 2;
    const lineHeight = size * 0.08;
    const lineY = size * 0.72;
    const lineGap = size * 0.12;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 1 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Single centered star */}
            <g
                transform={`translate(${startX}, ${size * 0.08}) scale(${starSize / 24})`}
            >
                <path
                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* Two lines below */}
            <rect
                x={lineStartX}
                y={lineY}
                width={lineWidth}
                height={lineHeight}
                rx={lineHeight / 2}
                fill="currentColor"
            />
            <rect
                x={lineStartX}
                y={lineY + lineHeight + lineGap}
                width={lineWidth * 0.8}
                height={lineHeight}
                rx={lineHeight / 2}
                fill="currentColor"
            />
        </svg>
    );
}
