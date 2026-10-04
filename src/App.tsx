import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { StatRow } from './components/dashboard/StatRow';
import { ProjectTable } from './components/dashboard/ProjectTable';
import { useDashboard, useProjects } from './hooks/useApi';
import { ExpensePage } from './pages/ExpensePage';
import { ScanInvoicePage } from './pages/ScanInvoicePage';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function App() {
  // State untuk navigasi tab
  const [activeTab, setActiveTab] = useState('Ringkasan Utama');
  
  // State untuk filter bulan (default bulan ini: "YYYY-MM")
  const [currentMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  // Ambil data dari backend
  const { data: dashboardData, loading: dashLoading } = useDashboard(currentMonth);
  const { projects, loading: projLoading } = useProjects(currentMonth);

  // Fungsi untuk me-render konten berdasarkan tab yang aktif
  const renderContent = () => {
    if (activeTab === 'Proyek & Klien') {
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>Daftar Proyek & Klien</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>Daftar semua proyek klien yang berjalan dan riwayat bulan sebelumnya.</p>
            </div>
            <button className="btn btn-primary">+ Proyek Baru</button>
          </div>
          <ProjectTable projects={projects} />
        </>
      );
    }
    
    if (activeTab === 'Pantau Piutang') {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
          Halaman Pantau Piutang (Belum Diimplementasi)
        </div>
      );
    }

    if (activeTab === 'Scan Invoice (Masuk)') {
      return <ScanInvoicePage />;
    }
    
    if (activeTab === 'Catat Pengeluaran') {
      return <ExpensePage />;
    }

    if (activeTab === 'Laporan (Sheets)') {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
          Halaman Laporan (Belum Diimplementasi)
        </div>
      );
    }

    // Default: Ringkasan Utama
    if (dashLoading) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
          Memuat data dari server...
        </div>
      );
    }

    const kpi = dashboardData?.kpi || {
      omzet: { value: 0 },
      kas_masuk: { value: 0 },
      pengeluaran: { value: 0 },
    };

    return (
      <div style={{ paddingTop: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>Ringkasan Keuangan</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-slate)', marginBottom: '24px' }}>Oktober 2026</p>
        <StatRow kpi={kpi} />
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
