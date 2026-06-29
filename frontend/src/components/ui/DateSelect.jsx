import { useState, useRef, useEffect } from "react";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function DateDropdown({
    value,
    options,
    onChange,
    onOpen,
    isOpen,
    formatOption,
    className = "",
}) {
    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={onOpen}
                className="w-full py-1 px-1 text-sm text-text-light hover:text-text-mid transition-colors bg-transparent focus:outline-none text-center"
            >
                {formatOption ? formatOption(value) : value}
            </button>
            {isOpen && (
                <ul className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-surface-50 border border-surface-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto min-w-10">
                    {options.map((opt) => (
                        <li key={opt.value}>
                            <button
                                type="button"
                                onClick={() => onChange(opt.value)}
                                className={`w-full text-center px-2 py-1.5 text-sm transition-colors ${
                                    opt.value === value
                                        ? "text-text-dark font-medium bg-surface-100"
                                        : "text-text-mid hover:bg-surface-200"
                                }`}
                            >
                                {opt.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function DateSelect({ value, onChange, max }) {
    const [openField, setOpenField] = useState(null);
    const containerRef = useRef(null);

    const parsed = value
        ? value.split("-").map(Number)
        : [
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              new Date().getDate(),
          ];
    const [year, month, day] = parsed;

    const maxDate = max ? new Date(max) : new Date();
    const maxYear = maxDate.getFullYear();
    const minYear = maxYear - 10;

    const daysInMonth = new Date(year, month, 0).getDate();

    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, "0"),
    }));

    const monthOptions = MONTHS.map((m, i) => ({
        value: i + 1,
        label: m,
    }));

    const yearOptions = Array.from(
        { length: maxYear - minYear + 1 },
        (_, i) => ({ value: maxYear - i, label: String(maxYear - i) }),
    );

    const handleChange = (newDay, newMonth, newYear) => {
        const clamped = Math.min(
            newDay,
            new Date(newYear, newMonth, 0).getDate(),
        );
        const formatted = `${newYear}-${String(newMonth).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
        onChange(formatted);
        setOpenField(null);
    };

    useEffect(() => {
        if (!openField) return;
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpenField(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [openField]);

    const divider = (
        <span className="self-center h-4 border-l border-surface-300 group-hover:border-surface-400/50 transition-colors mx-1 shrink-0" />
    );

    return (
        <div
            ref={containerRef}
            className="group flex sm:inline-flex items-stretch overflow-visible bg-surface-100 hover:bg-surface-200/50 transition-colors rounded-lg px-2 py-1"
        >
            <DateDropdown
                value={day}
                options={dayOptions}
                isOpen={openField === "day"}
                onOpen={() => setOpenField(openField === "day" ? null : "day")}
                onChange={(val) => handleChange(val, month, year)}
                formatOption={(v) => String(v).padStart(2, "0")}
                className="flex-1 sm:flex-none"
            />
            {divider}
            <DateDropdown
                value={month}
                options={monthOptions}
                isOpen={openField === "month"}
                onOpen={() =>
                    setOpenField(openField === "month" ? null : "month")
                }
                onChange={(val) => handleChange(day, val, year)}
                formatOption={(v) => MONTHS[v - 1]}
                className="flex-1 sm:flex-none"
            />
            {divider}
            <DateDropdown
                value={year}
                options={yearOptions}
                isOpen={openField === "year"}
                onOpen={() =>
                    setOpenField(openField === "year" ? null : "year")
                }
                onChange={(val) => handleChange(day, month, val)}
                className="flex-1 sm:flex-none"
            />
        </div>
    );
}

export default DateSelect;
