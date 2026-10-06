import React from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  FolderKanban,
  Plus,
  FileText,
  Calendar,
  User,
  Layers,
  Coins,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import './Dashboard.css';

interface ProjectTableProps {
  projects: any[];
  filterMonth: string;
  onFilterMonthChange: (month: string) => void;
  onAddProject: () => void;
}

const monthOptions = [
  { value: '', label: 'Lihat Semua' },
  { value: '2026-05', label: 'Mei 2026' },
  { value: '2026-06', label: 'Juni 2026' },
  { value: '2026-07', label: 'Juli 2026' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-10', label: 'Oktober 2026' },
];

/**
 * ProjectTable Component
 * Tabel daftar proyek dengan header aksen, chip invoice,
 * dan indikator status pastel modern (ultra-ringan & cepat tanpa aset eksternal).
 */
export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  filterMonth,
  onFilterMonthChange,
  onAddProject,
}) => {
  const formatRp = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  return (
    <Card variant="base" className="project-table-card">
      <div className="table-header-row">
        <div className="table-title-group">
          <div className="table-title-icon">
            <FolderKanban size={18} />
          </div>
          <div className="table-title-text">
            <h3>Proyek Terbaru</h3>
            {projects.length > 0 && (
              <span className="table-count-badge">{projects.length} Proyek</span>
            )}
          </div>
        </div>

        <div className="table-header-actions">
          <Select
            value={filterMonth}
            onChange={onFilterMonthChange}
            placeholder="Lihat Semua"
            options={monthOptions}
          />
          <button className="btn btn-primary btn-size-md table-new-btn" onClick={onAddProject}>
            <Plus size={16} />
            <span>Proyek Baru</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="miro-table">
          <thead>
            <tr>
              <th>
                <span className="th-content">
                  <FileText size={12} className="th-icon" />
                  No. Invoice
                </span>
              </th>
              <th>
                <span className="th-content">
                  <Calendar size={12} className="th-icon" />
                  Tanggal
                </span>
              </th>
              <th>
                <span className="th-content">
                  <User size={12} className="th-icon" />
                  Klien
                </span>
              </th>
              <th className="col-pekerjaan">
                <span className="th-content">
                  <Layers size={12} className="th-icon" />
                  Pekerjaan
                </span>
              </th>
              <th className="text-right">
                <span className="th-content-right">
                  <Coins size={12} className="th-icon" />
                  Nilai Proyek
                </span>
              </th>
              <th className="text-center">
                <span className="th-content-center">
                  <CheckCircle2 size={12} className="th-icon" />
                  Status
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const isLunas = p.status_bayar === 'LUNAS';
              return (
                <tr key={p.id_proyek}>
                  <td>
                    <span className="invoice-chip">
                      <FileText size={12} className="invoice-chip-icon" />
                      {p.id_proyek}
                    </span>
                  </td>
                  <td>
                    <span className="td-date">
                      {format(new Date(p.tanggal), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </td>
                  <td>
                    <span className="client-name">{p.nama_klien}</span>
                  </td>
                  <td className="text-slate truncate max-w-[200px] col-pekerjaan" title={p.pekerjaan}>
                    {p.pekerjaan}
                  </td>
                  <td className="text-right">
                    <span className="td-nominal">{formatRp(p.nilai_proyek)}</span>
                  </td>
                  <td className="text-center">
                    <span className={`status-pill ${isLunas ? 'status-pill-lunas' : 'status-pill-dp'}`}>
                      <span className={`status-dot ${isLunas ? 'status-dot-lunas' : 'status-dot-dp'}`} />
                      {p.status_bayar}
                    </span>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="table-empty-state">
                    <div className="table-empty-icon">
                      <Inbox size={24} />
                    </div>
                    <p className="font-medium">Tidak ada proyek di bulan ini</p>
                    <p className="text-xs text-slate">Pilih filter bulan lain atau tambahkan proyek baru.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
