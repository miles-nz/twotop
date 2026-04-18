import { useTheme } from "../../contexts/ThemeContext";
import { themes } from "../../themes";
import { tutorialExamples } from "../../resources";

export default function SlideThemes() {
    const { isDarkMode } = useTheme();
    const mode = isDarkMode ? "dark" : "light";

    const scrollDuration = (5 * tutorialExamples.reviewCardExamples.length) / 3;

    const cards = tutorialExamples.reviewCardExamples
        .filter((example) => themes[mode][example.theme])
        .map((example) => {
            const t = themes[mode][example.theme];
            const rating = example.rating[0];
            return {
                id: example.theme,
                bg: t["--color-surface-100"],
                border: t["--color-surface-200"],
                titleColor: t["--color-text-dark"],
                bodyColor: t["--color-text-mid"],
                primaryAccentColor: t["--color-primary-400"],
                secondaryAccentColor: t["--color-secondary-400"],
                text: example.text,
                stars: Math.round(rating),
            };
        });

    return (
        <div className="w-full h-full overflow-hidden relative">
            <div
                className="flex flex-col absolute w-full"
                style={{
                    animation: `tutorialScroll ${scrollDuration}s linear infinite`,
                }}
            >
                {[0, 1].map((copy) => (
                    <div key={copy} className="flex flex-col gap-2 px-4 py-3">
                        {cards.map((c, i) => (
                            <div
                                key={`${c.id}-${i}`}
                                className="rounded-xl p-3 border"
                                style={{
                                    background: c.bg,
                                    borderColor: c.border,
                                    borderLeft: `4px solid ${c.secondaryAccentColor}`,
                                }}
                            >
                                <div
                                    className="text-xs font-medium mb-1"
                                    style={{ color: c.primaryAccentColor }}
                                >
                                    {"★".repeat(c.stars)}
                                    {"☆".repeat(5 - c.stars)}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{ color: c.bodyColor }}
                                >
                                    {c.text}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <style>{`@keyframes tutorialScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }`}</style>
        </div>
    );
}
