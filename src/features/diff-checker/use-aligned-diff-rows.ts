import { useLayoutEffect, type RefObject } from "react";
import type { DiffChange } from "./diff-checker.service";

/** Keep matching comparison rows aligned when either side soft-wraps. */
export function useAlignedDiffRows(
  leftRef: RefObject<HTMLDivElement | null>,
  rightRef: RefObject<HTMLDivElement | null>,
  changes: DiffChange[],
  lineWrap: boolean,
  syntax: string,
): void {
  useLayoutEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;
    let frame = 0;
    const align = (): void => {
      const leftRows = Array.from(left.children) as HTMLElement[];
      const rightRows = Array.from(right.children) as HTMLElement[];
      // Reset old measurements before reading natural heights; do not measure on scroll.
      for (const row of [...leftRows, ...rightRows]) row.style.minHeight = "";
      const heights = leftRows.map((row, index) =>
        Math.ceil(
          Math.max(
            row.getBoundingClientRect().height,
            rightRows[index]?.getBoundingClientRect().height ?? 0,
          ),
        ),
      );
      heights.forEach((height, index) => {
        leftRows[index].style.minHeight = `${height}px`;
        if (rightRows[index]) rightRows[index].style.minHeight = `${height}px`;
      });
    };
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(align);
    };
    align();
    const resize = new ResizeObserver(schedule);
    resize.observe(left);
    resize.observe(right);
    document.fonts?.addEventListener("loadingdone", schedule);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [leftRef, rightRef, changes, lineWrap, syntax]);
}
