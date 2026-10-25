import type { Locator } from "@playwright/test";

/** Composite ancestor surfaces, including alpha, before checking visible text. */
export async function contrast(locator: Locator): Promise<number> {
  return locator.evaluate((node) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "white";
    context.fillRect(0, 0, 1, 1);
    const ancestors: Element[] = [];
    for (let element: Element | null = node; element; element = element.parentElement)
      ancestors.unshift(element);
    for (const element of ancestors) {
      context.fillStyle = getComputedStyle(element).backgroundColor;
      context.fillRect(0, 0, 1, 1);
    }
    const background = context.getImageData(0, 0, 1, 1).data;
    context.fillStyle = getComputedStyle(node).color;
    context.fillRect(0, 0, 1, 1);
    const foreground = context.getImageData(0, 0, 1, 1).data;
    const luminance = (pixels: Uint8ClampedArray): number => {
      const values = Array.from(pixels)
        .slice(0, 3)
        .map((value) => {
          const channel = value / 255;
          return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const first = luminance(background);
    const second = luminance(foreground);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  });
}
