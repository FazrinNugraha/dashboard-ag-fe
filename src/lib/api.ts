// Basis URL API. Atur lewat VITE_API_BASE_URL (mis. lewat Environment Variables Vercel).
// - Production: default relatif "/api/v1" agar diproksikan oleh Vercel (lihat vercel.json),
//   sehingga cookie sesi jadi first-party dan tidak diblokir browser (Safari/iOS).
// - Development: fallback ke backend lokal.
const fallback = import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1';
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? fallback;