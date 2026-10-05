/**
 * Utility untuk input nominal uang dengan format titik ribuan.
 *
 * Cara kerja:
 *  - formatRupiah("2000000")  → "2.000.000"
 *  - parseRupiah("2.000.000") → 2000000
 *  - handleMoneyInput dipakai sebagai onChange handler di input text:
 *    menerima raw input user (bisa ada titik atau tidak), membersihkan,
 *    lalu mengembalikan string terformat "X.XXX.XXX" ke state.
 */

/** Ubah angka / string angka mentah → string berformat "1.000.000" */
export function formatRupiah(raw: string | number): string {
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

/** Ubah string terformat "2.000.000" → integer 2000000 */
export function parseRupiah(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Handler onChange untuk input type="text" field uang.
 * Gunakan di onChange:
 *   onChange={(e) => setFormData({ ...formData, nominal: handleMoneyInput(e.target.value) })}
 */
export function handleMoneyInput(raw: string): string {
  return formatRupiah(raw);
}
