export const uploadRules = {
  MAX_FILE_SIZE: 15 * 1024 * 1024, // 15MB
  MAX_FILES: 20,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;