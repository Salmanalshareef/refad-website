"use client";

import { useEffect } from "react";

/**
 * Admin forms are used two ways, and a save has to mean something different in
 * each: inline on a row while editing, where finishing should close the form,
 * and standing at the top of a page for creating, where there is nothing to
 * close and the save has to say so instead.
 *
 * Before this, neither happened — the save actions returned nothing on success,
 * so an edited row simply sat there with no sign it had saved.
 */
export function useSaveOutcome(
  state: { success?: boolean } | undefined,
  onDone?: () => void
) {
  const saved = Boolean(state?.success);

  useEffect(() => {
    // Running this twice is harmless: closing unmounts the form.
    if (saved) onDone?.();
  }, [saved, onDone]);

  return { showSaved: saved && !onDone };
}
