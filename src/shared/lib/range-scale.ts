export interface RangeScale {
  min: number;
  max: number;
  step: number;
  /** Optional labelled center anchor; values on either side remain proportional. */
  midpoint?: number;
}

export function snapRangeValue(value: number, scale: RangeScale): number {
  const steps = Math.round((value - scale.min) / scale.step);
  return Math.min(scale.max, Math.max(scale.min, scale.min + steps * scale.step));
}

export function rangePosition(value: number, scale: RangeScale): number {
  const bounded = Math.min(scale.max, Math.max(scale.min, value));
  if (scale.midpoint !== undefined) {
    return bounded <= scale.midpoint
      ? (0.5 * (bounded - scale.min)) / (scale.midpoint - scale.min)
      : 0.5 + (0.5 * (bounded - scale.midpoint)) / (scale.max - scale.midpoint);
  }
  return (bounded - scale.min) / (scale.max - scale.min);
}

export function rangeValue(position: number, scale: RangeScale): number {
  const bounded = Math.min(1, Math.max(0, position));
  const value =
    scale.midpoint === undefined
      ? scale.min + bounded * (scale.max - scale.min)
      : bounded <= 0.5
        ? scale.min + bounded * 2 * (scale.midpoint - scale.min)
        : scale.midpoint + (bounded - 0.5) * 2 * (scale.max - scale.midpoint);
  return snapRangeValue(value, scale);
}
