import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
 * Tabel daftar proyek. Filter bulan + tombol proyek baru berada di header card.
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
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <h3>Proyek Terbaru</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select
            value={filterMonth}
            onChange={onFilterMonthChange}
            placeholder="Lihat Semua"
            options={monthOptions}
          />
          <button className="btn btn-primary btn-size-md" onClick={onAddProject}>
            + Proyek Baru
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="miro-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Tanggal</th>
              <th>Klien</th>
              <th>Pekerjaan</th>
              <th className="text-right">Nilai Proyek</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id_proyek}>
                <td className="font-medium">{p.id_proyek}</td>
                <td className="text-slate">
                  {format(new Date(p.tanggal), 'dd MMM yyyy', { locale: id })}
                </td>
                <td>{p.nama_klien}</td>
                <td className="text-slate truncate max-w-[200px]">{p.pekerjaan}</td>
                <td className="text-right font-medium">{formatRp(p.nilai_proyek)}</td>
                <td className="text-center">
                  <Badge variant={p.status_bayar === 'LUNAS' ? 'success' : 'tag-yellow'}>
                    {p.status_bayar}
                  </Badge>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate py-8">
                  Tidak ada proyek di bulan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
