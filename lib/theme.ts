export const THEME_STORAGE_KEY = "refad-theme";

export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Runs before first paint, inlined into the document head, so the saved theme
 * is on the element before anything renders and the portal never flashes light
 * then dark. It resolves "system" here rather than in CSS so the stylesheet
 * only ever has to match [data-theme="dark"].
 *
 * Kept dependency-free and defensive: storage throws in some privacy modes,
 * and a failure here must not stop the page rendering.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||"system";
var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.dataset.theme=d?"dark":"light";
}catch(e){document.documentElement.dataset.theme="light";}})();`;

/** Applies a preference to the document and remembers it. */
export function applyTheme(preference: ThemePreference) {
  const resolved =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;

  document.documentElement.dataset.theme = resolved;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Private browsing can refuse storage; the theme still applies for this visit.
  }
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/* ── Preference as an external store ────────────────────────────────────────
   The preference lives in localStorage, which React cannot read during render
   on the server. Exposing it through useSyncExternalStore keeps components in
   step with it — including changes made in another tab — without reaching for
   state-in-an-effect. */

const listeners = new Set<() => void>();
let cached: ThemePreference | null = null;

function notify() {
  cached = null;
  // A change from another tab has to be applied here too, not just rendered.
  applyTheme(getThemeSnapshot());
  for (const listener of listeners) listener();
}

export function subscribeToTheme(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("storage", notify);
  };
}

/** Must return a stable value between renders, hence the cache. */
export function getThemeSnapshot(): ThemePreference {
  if (cached === null) cached = readStoredTheme();
  return cached;
}

/** Nothing is selected until the client has read storage. */
export function getThemeServerSnapshot(): ThemePreference {
  return "system";
}

export function setThemePreference(preference: ThemePreference) {
  applyTheme(preference);
  cached = preference;
  for (const listener of listeners) listener();
}
