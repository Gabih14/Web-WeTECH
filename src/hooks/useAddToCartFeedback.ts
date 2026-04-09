import { useCallback, useEffect, useRef, useState } from "react";

export function useAddToCartFeedback(durationMs = 1500) {
  const [justAdded, setJustAdded] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const triggerAddedFeedback = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setJustAdded(true);
    timeoutRef.current = window.setTimeout(() => {
      setJustAdded(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    justAdded,
    triggerAddedFeedback,
  };
}
