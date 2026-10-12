type Viewport = { convertToPdfPoint: (x: number, y: number) => number[] };
type Rect = { x: number; y: number; width: number; height: number };

export function toPdfRect(viewport: Viewport, displayRect: Rect): Rect {
  const first = viewport.convertToPdfPoint(displayRect.x, displayRect.y);
  const second = viewport.convertToPdfPoint(displayRect.x + displayRect.width, displayRect.y + displayRect.height);
  return { x: Math.min(first[0], second[0]), y: Math.min(first[1], second[1]), width: Math.abs(first[0] - second[0]), height: Math.abs(first[1] - second[1]) };
}
