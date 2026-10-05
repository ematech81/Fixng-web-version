// Safe wrapper around the Meta Pixel (fbq). No-ops on the server, when the pixel
// isn't loaded (no NEXT_PUBLIC_META_PIXEL_ID, ad-blocker), or if fbq throws —
// tracking must never break the app.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
  eventID?: string,
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    if (eventID) window.fbq('track', name, params ?? {}, { eventID });
    else if (params) window.fbq('track', name, params);
    else window.fbq('track', name);
  } catch {
    /* swallow — never let analytics break the page */
  }
}
