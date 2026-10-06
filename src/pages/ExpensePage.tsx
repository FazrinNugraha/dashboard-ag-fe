import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { API_BASE } from '../lib/api';
import { parseRupiah, handleMoneyInput, formatRupiah } from '../lib/currency';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Calendar, 
  Wallet, 
  FileText, 
  Package, 
  Wrench, 
  Users, 
  Fuel, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Check,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  {
    key: 'BAHAN_BAKU',
    label: 'Bahan Baku',
    desc: 'Kayu, besi, triplek, semen, baut, lem, dsb.',
    icon: Package,
    color: '#2563eb', // blue
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    key: 'AKSESORIS',
    label: 'Aksesoris',
    desc: 'Handle, engsel, rel laci, sekrup, kunci, dsb.',
    icon: Wrench,
    color: '#0d9488', // teal
    bg: '#f0fdfa',
    border: '#99f6e4',
  },
  {
    key: 'UPAH',
    label: 'Upah Tukang',
    desc: 'Ongkos tukang harian, borongan, mandor',
    icon: Users,
    color: '#e11d48', // rose
    bg: '#fff1f2',
    border: '#fecdd3',
  },
  {
    key: 'OPERASIONAL',
    label: 'Operasional',
    desc: 'BBM pikap, tol, konsumsi, listrik, pulsa',
    icon: Fuel,
    color: '#d97706', // amber
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    key: 'LAINNYA',
    label: 'Lain-lain',
    desc: 'Pengeluaran umum atau keperluan lainnya',
    icon: MoreHorizontal,
    color: '#64748b', // slate
    bg: '#f8fafc',
    border: '#e2e8f0',
  },
];

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

/**
 * Halaman Catat Pengeluaran
 * Desain simpel, bersih, dan jelas dengan dropdown pilihan kategori.
 */
export const ExpensePage: React.FC = () => {
  const [formData, setFormData] = useState(() => ({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'BAHAN_BAKU',
    keterangan: '',
    nominal: ''
  }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCat = CATEGORIES.find(c => c.key === formData.kategori) || CATEGORIES[0];

  const addQuickAmount = (val: number) => {
    const current = parseRupiah(formData.nominal) || 0;
    const next = current + val;
    setFormData({ ...formData, nominal: formatRupiah(next) });
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nominal || parseRupiah(formData.nominal) <= 0) {
      setError('Nominal pengeluaran harus lebih dari 0.');
      return;
    }
    if (!formData.keterangan.trim()) {
      setError('Keterangan pengeluaran wajib diisi.');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...formData,
        nominal: parseRupiah(formData.nominal) || 0
      };

      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           throw new Error('Anda belum login atau tidak memiliki akses (Harus Login)');
        }
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.detail?.message || errJson.detail || 'Terjadi kesalahan sistem');
      }

      setMessage('Pengeluaran berhasil dicatat!');
      setFormData({ ...formData, keterangan: '', nominal: '' }); // reset sebagian
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formattedDisplayDate = () => {
    try {
      return format(new Date(formData.tanggal), 'dd MMMM yyyy', { locale: id });
    } catch {
      return formData.tanggal;
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '8px' }}>
      <Card variant="base" style={{ padding: '24px 28px', boxShadow: 'var(--shadow-card)' }}>
        {/* Header Visual Form */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--rounded-lg)',
            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb',
            flexShrink: 0
          }}>
            <CreditCard size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
              Form Pengeluaran
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '2px 0 0' }}>
              Catat pengeluaran kas operasional atau belanja proyek
            </p>
          </div>
        </div>

        <form onSubmit={handlePreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca',
              padding: '12px 16px', borderRadius: 'var(--rounded-md)', fontSize: '13px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
              padding: '12px 16px', borderRadius: 'var(--rounded-md)', fontSize: '13px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{message}</span>
            </div>
          )}

          {/* Baris 1: Tanggal & Kategori Pengeluaran (2 Kolom Rapi) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '16px' }}>
            {/* Tanggal */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                <Calendar size={14} color="var(--color-steel)" /> Tanggal
              </label>
              <div style={{
                display: 'flex', alignItems: 'center',
                backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline-strong)',
                borderRadius: 'var(--rounded-md)', height: '42px', overflow: 'hidden'
              }}>
                <input 
                  type="date" 
                  required
                  value={formData.tanggal} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tanggal: e.target.value })} 
                  style={{
                    width: '100%', height: '100%', border: 'none', outline: 'none',
                    padding: '0 12px', fontSize: '14px', fontFamily: 'inherit',
                    color: 'var(--color-ink)', backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>

            {/* Kategori Pengeluaran (Dropdown Bersih & Jelas) */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                <Tag size={14} color="var(--color-steel)" /> Kategori Pengeluaran
              </label>
              
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: 'var(--color-canvas)',
                  border: isDropdownOpen ? '1.5px solid var(--color-brand-blue)' : '1px solid var(--color-hairline-strong)',
                  borderRadius: 'var(--rounded-md)',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isDropdownOpen ? '0 0 0 3px rgba(66, 98, 255, 0.12)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: 'var(--rounded-sm)',
                    backgroundColor: selectedCat.bg, color: selectedCat.color,
                    border: `1px solid ${selectedCat.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {React.createElement(selectedCat.icon, { size: 14 })}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    {selectedCat.label}
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    color: 'var(--color-steel)', 
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </button>

              {/* Popup Menu Dropdown */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-lg)',
                  boxShadow: '0 12px 28px -4px rgba(5, 0, 56, 0.14), 0 4px 10px -2px rgba(5, 0, 56, 0.06)',
                  zIndex: 50,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.kategori === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, kategori: cat.key });
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--rounded-md)',
                          border: 'none',
                          backgroundColor: isSelected ? 'var(--color-surface)' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: 'var(--rounded-sm)',
                            backgroundColor: cat.bg, color: cat.color,
                            border: `1px solid ${cat.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {React.createElement(cat.icon, { size: 14 })}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, color: 'var(--color-ink)' }}>
                              {cat.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-steel)', marginTop: '1px' }}>
                              {cat.desc}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={16} style={{ color: 'var(--color-brand-blue)', flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Baris 2: Nominal */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
              <Wallet size={14} color="var(--color-steel)" /> Nominal (Rp)
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline-strong)',
              borderRadius: 'var(--rounded-md)', height: '42px', overflow: 'hidden'
            }}>
              <span style={{
                backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-hairline-strong)',
                padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center',
                fontWeight: 600, fontSize: '13px', color: 'var(--color-slate)'
              }}>
                Rp
              </span>
              <input 
                type="text" 
                placeholder="0" 
                required
                value={formData.nominal} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nominal: handleMoneyInput(e.target.value) })} 
                style={{
                  flex: 1, height: '100%', border: 'none', outline: 'none',
                  padding: '0 12px', fontSize: '15px', fontWeight: 600,
                  fontFamily: 'inherit', color: 'var(--color-ink)', backgroundColor: 'transparent'
                }}
              />
            </div>

            {/* Tombol Cepat Tambah Nominal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addQuickAmount(amt)}
                  style={{
                    fontSize: '11px', fontWeight: 500,
                    backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--rounded-full)', padding: '3px 10px',
                    color: 'var(--color-slate)', cursor: 'pointer', transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)';
                    e.currentTarget.style.borderColor = 'var(--color-hairline-strong)';
                    e.currentTarget.style.color = 'var(--color-ink)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    e.currentTarget.style.borderColor = 'var(--color-hairline)';
                    e.currentTarget.style.color = 'var(--color-slate)';
                  }}
                >
                  +{amt >= 1000000 ? `${amt / 1000000} jt` : `${amt / 1000} rb`}
                </button>
              ))}
              {formData.nominal && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, nominal: '' })}
                  style={{
                    fontSize: '11px', fontWeight: 500,
                    backgroundColor: 'transparent', border: 'none',
                    color: '#dc2626', padding: '3px 6px', cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Baris 3: Keterangan / Keperluan */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
              <FileText size={14} color="var(--color-steel)" /> Keterangan / Keperluan
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline-strong)',
              borderRadius: 'var(--rounded-md)', height: '42px', overflow: 'hidden'
            }}>
              <input 
                type="text" 
                placeholder="Contoh: Beli handle pintu 5 lusin, bensin pikap, dsb." 
                required
                value={formData.keterangan} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, keterangan: e.target.value })} 
                style={{
                  width: '100%', height: '100%', border: 'none', outline: 'none',
                  padding: '0 12px', fontSize: '14px', fontFamily: 'inherit',
                  color: 'var(--color-ink)', backgroundColor: 'transparent'
                }}
              />
            </div>
          </div>

          {/* Tombol Simpan */}
          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              disabled={loading || !formData.nominal || !formData.keterangan} 
              variant="primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 22px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Simpan Pengeluaran
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Pop-up Konfirmasi Double-Layer Check */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 0, 56, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          /* Modal selalu terpusat (mobile & desktop) */
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-canvas)',
            borderRadius: 'var(--rounded-xl)',
            padding: '28px',
            paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
            width: '100%',
            maxWidth: '440px',
            maxHeight: '90dvh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-modal)',
            animation: 'modalFadeIn 0.2s ease'
          }}>
            {/* Header Popup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: 'var(--rounded-full)',
                backgroundColor: '#eff6ff', color: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                  Konfirmasi Pengeluaran
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '2px 0 0' }}>
                  Pastikan informasi berikut sudah benar sebelum dicatat.
                </p>
              </div>
            </div>

            {/* Kotak Ringkasan Data yang Diinput */}
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--rounded-md)',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Highlight Nominal Besar */}
              <div style={{ textAlign: 'center', paddingBottom: '10px', borderBottom: '1px dashed var(--color-hairline-strong)' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-steel)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nominal Pengeluaran
                </span>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  Rp {formData.nominal}
                </div>
              </div>

              {/* Rincian Lainnya */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-slate)' }}>Tanggal</span>
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{formattedDisplayDate()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-slate)' }}>Kategori</span>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  backgroundColor: selectedCat.bg, border: `1px solid ${selectedCat.border}`,
                  padding: '3px 10px', borderRadius: 'var(--rounded-full)',
                  fontSize: '12px', fontWeight: 600, color: selectedCat.color
                }}>
                  {selectedCat.label}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-slate)' }}>Keterangan / Keperluan:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-ink)', backgroundColor: 'var(--color-canvas)', padding: '8px 10px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)' }}>
                  {formData.keterangan}
                </span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <Button
                variant="secondary"
                style={{ flex: 1, minWidth: '140px', justifyContent: 'center', height: '38px' }}
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Periksa Kembali
              </Button>
              <Button
                variant="primary"
                style={{ flex: 1.2, minWidth: '160px', justifyContent: 'center', height: '38px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={handleConfirmedSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Ya, Simpan</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
