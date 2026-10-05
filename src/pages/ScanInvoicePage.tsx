import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { API_BASE } from '../lib/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Loader2, 
  User, 
  Calendar, 
  Briefcase, 
  MapPin 
} from 'lucide-react';

export const ScanInvoicePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatRp = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Hanya file berformat .pdf yang didukung.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Ukuran file melebihi batas maksimal 5 MB.');
      return;
    }
    setError('');
    setFile(selectedFile);
    setPreviewData(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/invoices/extract`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-requested-with': 'XMLHttpRequest'
        },
        body: formData,
      });

      if (!res.ok) {
        let errMsg = 'Gagal mengekstrak invoice.';
        try {
          const errJson = await res.json();
          errMsg = errJson.error?.message || errJson.detail?.message || errJson.detail || errMsg;
        } catch (e) {}
        
        if (res.status === 401 || res.status === 403) {
           errMsg = 'Fitur ini dilindungi. Anda belum login atau token Anda kadaluarsa.';
        }
        throw new Error(errMsg);
      }

      const json = await res.json();
      setPreviewData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewData) return;
    setSaving(true);
    setError('');
    
    try {
      const payload = { 
        id_proyek: previewData.nomor_invoice,
        tanggal: previewData.tanggal,
        nama_klien: previewData.nama_klien,
        alamat: previewData.alamat,
        pekerjaan: previewData.pekerjaan,
        subtotal: previewData.subtotal,
        diskon: previewData.diskon,
        dp: previewData.dp || 0 
      };
      
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = 'Gagal menyimpan proyek';
        try {
          const errJson = await res.json();
          const d = errJson.error?.details;
          if (d) {
            const detailStr = typeof d === 'string' ? d : JSON.stringify(d);
            errMsg = `${errJson.error.message ?? errMsg} (${detailStr})`;
          } else {
            errMsg = errJson.error?.message || errJson.detail?.message || (typeof errJson.detail === 'string' ? errJson.detail : errMsg) || errMsg;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      setSuccess(true);
      setPreviewData(null);
      setFile(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewData(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingTop: '8px' }}>
      <Card variant="base" style={{ padding: '24px' }}>
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca',
            padding: '12px 16px', borderRadius: 'var(--rounded-md)', fontSize: '13px', marginBottom: '16px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
            padding: '12px 16px', borderRadius: 'var(--rounded-md)', fontSize: '13px', marginBottom: '16px'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Data invoice berhasil diekstrak dan disimpan ke daftar proyek! Mengalihkan...</span>
          </div>
        )}

        {/* Input File Tersembunyi */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="application/pdf"
          onChange={e => handleFileChange(e.target.files?.[0] || null)} 
          style={{ display: 'none' }}
        />

        {/* Dropzone jika belum ada file */}
        {!file ? (
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragActive ? 'var(--color-brand-blue)' : 'var(--color-hairline-strong)'}`,
              borderRadius: 'var(--rounded-lg)',
              backgroundColor: dragActive ? '#f0f3ff' : 'var(--color-surface-soft)',
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: 'var(--rounded-full)',
              backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-ink)', boxShadow: 'var(--shadow-subtle)'
            }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', margin: 0 }}>
                Tarik file invoice PDF ke sini, atau <span style={{ color: 'var(--color-brand-blue)', textDecoration: 'underline' }}>Pilih File</span>
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-steel)', margin: '4px 0 0' }}>
                Format PDF maks 5 MB &bull; Diekstrak otomatis dengan AI
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* File Chip yang terpilih */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-hairline-strong)',
              borderRadius: 'var(--rounded-md)', padding: '10px 14px', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: 'var(--rounded-sm)',
                  backgroundColor: '#fee2e2', color: '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FileText size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, maxWidth: '360px'
                  }} title={file.name}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-steel)', margin: '2px 0 0' }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={clearFile}
                title="Hapus file"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--color-steel)',
                  padding: '4px', borderRadius: 'var(--rounded-full)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tombol Ekstraksi jika belum ada hasil */}
            {!previewData && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="secondary" onClick={clearFile} disabled={loading}>
                  Batal
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={loading} 
                  variant="primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Mengekstrak AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Ekstrak Data Invoice
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Hasil Ekstraksi AI yang Rapi & Terstruktur */}
        {previewData && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-hairline)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                <Sparkles size={18} color="var(--color-brand-blue)" />
                <span>Hasil Ekstraksi Dokumen</span>
              </div>
              <Badge variant="promo">
                {previewData.nomor_invoice || 'Invoice Baru'}
              </Badge>
            </div>

            {/* Grid Informasi Kunci */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--rounded-md)', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-steel)', marginBottom: '4px' }}>
                  <User size={13} /> Klien
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {previewData.nama_klien || '-'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--rounded-md)', padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-steel)', marginBottom: '4px' }}>
                  <Calendar size={13} /> Tanggal
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {previewData.tanggal || '-'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--rounded-md)', padding: '10px 14px', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-steel)', marginBottom: '4px' }}>
                  <Briefcase size={13} /> Pekerjaan
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {previewData.pekerjaan || '-'}
                </div>
              </div>

              {previewData.alamat && (
                <div style={{ backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-hairline-soft)', borderRadius: 'var(--rounded-md)', padding: '10px 14px', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-steel)', marginBottom: '4px' }}>
                    <MapPin size={13} /> Alamat
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    {previewData.alamat}
                  </div>
                </div>
              )}
            </div>

            {/* Rincian Item (jika tersedia) */}
            {previewData.items && previewData.items.length > 0 && (
              <div style={{ marginBottom: '16px', borderRadius: 'var(--rounded-md)', overflow: 'hidden', border: '1px solid var(--color-hairline-soft)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: 'var(--color-surface-soft)' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-hairline)' }}>
                      <th style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-steel)', padding: '8px 14px' }}>
                        Rincian Item
                      </th>
                      <th style={{ textAlign: 'right', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-steel)', padding: '8px 14px' }}>
                        Harga
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: idx < previewData.items.length - 1 ? '1px solid var(--color-hairline-soft)' : 'none' }}>
                        <td style={{ padding: '8px 14px', color: 'var(--color-ink)' }}>
                          <div style={{ fontWeight: 500 }}>{item.judul}</div>
                          {item.deskripsi && (
                            <div style={{ fontSize: '11px', color: 'var(--color-slate)', marginTop: '2px' }}>
                              {item.deskripsi}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 500, padding: '8px 14px', color: 'var(--color-ink)' }}>
                          {formatRp(item.harga)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Ringkasan Finansial */}
            <div style={{
              backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--rounded-md)', padding: '14px 16px', marginBottom: '20px',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-slate)' }}>
                <span>Subtotal</span>
                <span>{formatRp(previewData.subtotal)}</span>
              </div>
              {previewData.diskon > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-success)' }}>
                  <span>Diskon</span>
                  <span>-{formatRp(previewData.diskon)}</span>
                </div>
              )}
              {previewData.dp > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-slate)' }}>
                  <span>Down Payment (DP)</span>
                  <span>{formatRp(previewData.dp)}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)',
                paddingTop: '8px', borderTop: '1px dashed var(--color-hairline-strong)', marginTop: '4px'
              }}>
                <span>Total Nilai Proyek</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatRp(previewData.nilai_proyek)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '2px' }}>
                <span style={{ color: 'var(--color-slate)' }}>Sisa Tagihan</span>
                <span style={{ fontWeight: 600, color: previewData.sisa > 0 ? '#b45309' : 'var(--color-success)' }}>
                  {previewData.sisa > 0 ? formatRp(previewData.sisa) : 'LUNAS'}
                </span>
              </div>
            </div>

            {/* Warning dari AI jika ada */}
            {previewData.warnings && previewData.warnings.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a',
                padding: '12px 16px', borderRadius: 'var(--rounded-md)', fontSize: '13px', marginBottom: '16px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>Perhatian Ekstraksi:</div>
                  <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {previewData.warnings.map((w: any, idx: number) => (
                      <li key={idx}>{w.message || w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              <Button variant="secondary" onClick={clearFile} disabled={saving}>
                Ganti File
              </Button>
              <Button 
                variant="yellow" 
                onClick={handleSave} 
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Simpan sebagai Proyek Berjalan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
