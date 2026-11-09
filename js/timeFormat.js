/**
 * Display helpers — keep stored slot values as 24h (e.g. "16:00"),
 * show users 12h AM/PM (e.g. "4:00 PM").
 */

/** @param {string} value 24h "HH:MM" or already-formatted text */
export function formatTime12(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (/[ap]m/i.test(raw) && !/[–-]/.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;

  let hour = Number(match[1]);
  const minutes = match[2];
  if (!Number.isFinite(hour)) return raw;

  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minutes} ${suffix}`;
}

/** Format one slot or a multi-hour label for display. */
export function formatSlotLabel(slotsOrLabel) {
  if (Array.isArray(slotsOrLabel)) {
    const sorted = [...slotsOrLabel].filter(Boolean).sort();
    if (!sorted.length) return '';
    if (sorted.length === 1) return formatTime12(sorted[0]);
    return `${formatTime12(sorted[0])}–${formatTime12(sorted[sorted.length - 1])} (${sorted.length} hr)`;
  }

  const label = String(slotsOrLabel || '');
  // "07:00–08:00 (2 hr)" → AM/PM
  const range = label.match(/^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})(.*)$/);
  if (range) {
    return `${formatTime12(range[1])}–${formatTime12(range[2])}${range[3] || ''}`;
  }
  return formatTime12(label);
}
