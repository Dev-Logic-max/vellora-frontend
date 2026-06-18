import { cn } from "@/lib/utils";

/**
 * Dependency-free decorative QR surface. Renders a deterministic dot matrix
 * derived from the payload so each rotating code looks distinct, with the code
 * shown beneath for manual entry.
 *
 * NOTE: this is a visual placeholder, not a scannable code. Swap in the
 * `qrcode` lib (proposed stack addition) for a real scannable QR.
 */
function hashToBits(input: string, cells: number): boolean[] {
  const bits: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < cells; i += 1) {
    const ch = input.charCodeAt(i % input.length) + i * 31;
    h = (h ^ ch) >>> 0;
    h = (h * 16777619) >>> 0;
    bits.push((h & 1) === 1);
  }
  return bits;
}

export function QrCode({
  payload,
  size = 200,
  className,
}: {
  payload: string;
  size?: number;
  className?: string;
}) {
  const grid = 21;
  const bits = hashToBits(payload, grid * grid);
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, grid - 7) || inBox(grid - 7, 0);
  };
  const finderOn = (r: number, c: number) => {
    const local = (br: number, bc: number) => {
      const rr = r - br;
      const cc = c - bc;
      const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      return edge || core;
    };
    if (r < 7 && c < 7) return local(0, 0);
    if (r < 7 && c >= grid - 7) return local(0, grid - 7);
    return local(grid - 7, 0);
  };

  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <div
        className="rounded-xl border border-border bg-white p-3 shadow-sm"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Clock-in QR code"
      >
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}>
          {bits.map((on, i) => {
            const r = Math.floor(i / grid);
            const c = i % grid;
            const filled = isFinder(r, c) ? finderOn(r, c) : on;
            return (
              <span
                key={i}
                className={filled ? "bg-zinc-900" : "bg-transparent"}
                style={{ aspectRatio: "1 / 1" }}
              />
            );
          })}
        </div>
      </div>
      <code className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
        {payload.slice(0, 28)}
      </code>
    </div>
  );
}
