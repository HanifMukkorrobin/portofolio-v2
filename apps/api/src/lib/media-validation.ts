function matchesBytes(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
  if (bytes.byteLength < offset + expected.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    if (bytes[offset + i] !== expected[i]) return false;
  }
  return true;
}

function asciiSlice(bytes: Uint8Array, start: number, end: number): string {
  let out = '';
  const limit = Math.min(bytes.byteLength, end);
  for (let i = start; i < limit; i += 1) {
    out += String.fromCharCode(bytes[i]!);
  }
  return out;
}

/**
 * Inspects file magic bytes to detect supported raster image and PDF formats.
 */
export function detectMediaMimeType(bytes: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (matchesBytes(bytes, 0, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (matchesBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }

  // WebP: RIFF....WEBP
  if (
    bytes.byteLength >= 12 &&
    asciiSlice(bytes, 0, 4) === 'RIFF' &&
    asciiSlice(bytes, 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  // PDF: %PDF-
  if (bytes.byteLength >= 5 && asciiSlice(bytes, 0, 5) === '%PDF-') {
    return 'application/pdf';
  }

  return null;
}

export function matchesDeclaredMimeType(bytes: Uint8Array, declaredMime: string): boolean {
  const detected = detectMediaMimeType(bytes);
  return detected !== null && detected === declaredMime;
}
