import type { CSSProperties, JSX } from "react";
import { cn } from "@/shared/lib/cn";
import {
  rangePosition,
  rangeValue,
  snapRangeValue,
  type RangeScale,
} from "@/shared/lib/range-scale";

interface RangeInputProps extends Omit<RangeScale, "step"> {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
  marks?: number[];
  formatValue?: (value: number) => string;
  className?: string;
}

/** Native pointer/touch input with logical-value keyboard and accessibility semantics. */
export function RangeInput({
  label,
  value,
  min,
  max,
  step = 1,
  midpoint,
  onChange,
  marks,
  formatValue = String,
  className,
}: RangeInputProps): JSX.Element {
  const scale = { min, max, step, midpoint };
  const position = rangePosition(value, scale);
  const ticks = marks ?? [min, snapRangeValue((min + max) / 2, scale), max];
  return (
    <div className={cn("min-w-0", className)} data-range-control="">
      <input
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formatValue(value)}
        className="forge-range block w-full"
        max={midpoint === undefined ? max : 1}
        min={midpoint === undefined ? min : 0}
        step={midpoint === undefined ? step : "any"}
        style={{ "--range-fill": `${position * 100}%` } as CSSProperties}
        type="range"
        value={midpoint === undefined ? value : position}
        onChange={(event) =>
          onChange(
            midpoint === undefined
              ? snapRangeValue(Number(event.target.value), scale)
              : rangeValue(Number(event.target.value), scale),
          )
        }
        onKeyDown={(event) => {
          const changes: Record<string, number> = {
            ArrowRight: value + step,
            ArrowUp: value + step,
            ArrowLeft: value - step,
            ArrowDown: value - step,
            PageUp: value + step * 10,
            PageDown: value - step * 10,
            Home: min,
            End: max,
          };
          if (event.key in changes) {
            event.preventDefault();
            onChange(snapRangeValue(changes[event.key], scale));
          }
        }}
      />
      <div
        aria-hidden="true"
        className="relative mx-2 h-5 text-[11px] tabular-nums text-slate-500"
      >
        {ticks.map((mark) => (
          <span
            className="absolute -translate-x-1/2"
            key={mark}
            style={{ left: `${rangePosition(mark, scale) * 100}%` }}
          >
            {mark}
          </span>
        ))}
      </div>
    </div>
  );
}
