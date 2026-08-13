/* Subtle cursor-based 3D tilt for `.lift` cards.
   Desktop (fine pointer) only · disabled for reduced motion.
   Kept intentionally tiny: max ±2.4° so the depth is felt, not seen. */

export function initCardTilt(): () => void {
  const w = typeof window !== "undefined" ? window : null;
  if (
    !w ||
    !w.matchMedia("(pointer: fine)").matches ||
    w.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => {};
  }

  let active: HTMLElement | null = null;

  const clear = () => {
    if (active) {
      active.style.removeProperty("transform");
      active = null;
    }
  };

  const over = (e: PointerEvent) => {
    const el = (e.target as HTMLElement | null)?.closest?.(".lift") as HTMLElement | null;
    if (el !== active) {
      clear();
      active = el;
    }
  };

  const out = (e: PointerEvent) => {
    const next = (e.relatedTarget as HTMLElement | null)?.closest?.(".lift");
    if (!next) clear();
  };

  const move = (e: PointerEvent) => {
    if (!active) return;
    const r = active.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    active.style.transform = `perspective(900px) translateZ(12px) rotateX(${(-dy * 2).toFixed(
      2
    )}deg) rotateY(${(dx * 2.4).toFixed(2)}deg)`;
  };

  w.addEventListener("pointerover", over);
  w.addEventListener("pointerout", out);
  w.addEventListener("pointermove", move);

  return () => {
    w.removeEventListener("pointerover", over);
    w.removeEventListener("pointerout", out);
    w.removeEventListener("pointermove", move);
    clear();
  };
}
