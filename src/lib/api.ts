// Basis URL API. Atur lewat VITE_API_BASE_URL (mis. saat deploy).
// Fallback ke backend lokal saat development.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';