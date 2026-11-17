import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-driven step index for a tall section with a sticky inner panel.
 * Returns [ref for the tall section, active index, jump(i) to scroll to a step].
 */
export function useScrollStep(count) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(0.9999, Math.max(0, -el.getBoundingClientRect().top / total)) : 0;
      setActive(Math.floor(p * count));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  const jump = useCallback((i) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + ((i + 0.5) / count) * total, behavior: "smooth" });
  }, [count]);

  return [ref, active, jump];
}
