export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_MESSAGE_CHARS = 2000;

// Returns an error message for the user, or null when the image is fine (or absent).
export function validateImage(file: { type: string; size: number } | null): string | null {
  if (!file) return null;
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return "Send a JPEG, PNG or WebP photo.";
  if (file.size > MAX_IMAGE_BYTES) return "That photo is over 5 MB. Send a smaller one.";
  return null;
}
