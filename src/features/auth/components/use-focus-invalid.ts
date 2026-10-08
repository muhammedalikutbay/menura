"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Moves focus to the first control marked `aria-invalid` inside the form after validation fails.
 * Call `requestFocus()` in the same handler that sets the errors.
 */
export function useFocusInvalid() {
  const formRef = useRef<HTMLFormElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (tick > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [tick]);

  return { formRef, requestFocus: () => setTick((value) => value + 1) };
}
