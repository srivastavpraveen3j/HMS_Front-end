// src/app/helper/urlHelper.ts

/**
 * Extracts the last segment (ID) and the previous segment (resource name) from a URL.
 *
 * Example:
 *   http://localhost:4200/opd/opdbill/68e4d69ae0dc5adb18f8c017
 *   => ['68e4d69ae0dc5adb18f8c017', 'opdbill']
 */
export function extractUrlSegments(url?: string): [string | null, string | null] {
  if (!url) {
    url = window.location.href;
  }

  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1] || null;
    const name = parts[parts.length - 2] || null;
    return [id, name];
  } catch {
    // Fallback for non-standard or relative URLs
    const parts = url.split('/').filter(Boolean);
    const id = parts[parts.length - 1] || null;
    const name = parts[parts.length - 2] || null;
    return [id, name];
  }
}
