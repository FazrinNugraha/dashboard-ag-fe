import React from 'react';
import { LayoutDashboard, Users, CreditCard, Receipt, FileText, Settings } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
}

/**
 * Layout Component
 * Membungkus seluruh aplikasi dengan Sidebar di kiri dan konten utama di kanan.
 * Sangat gampang dibaca karena kita memisahkan list menu ke dalam array.
 */
export const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'Dashboard', onTabChange }) => {
  const menus = [
    { name: 'Ringkasan Utama', icon: <LayoutDashboard size={20} /> },
    { name: 'Proyek & Klien', icon: <Users size={20} /> },
    { name: 'Pantau Piutang', icon: <Receipt size={20} /> },
    { name: 'Scan Invoice (Masuk)', icon: <FileText size={20} /> },
    { name: 'Catat Pengeluaran', icon: <CreditCard size={20} /> },
    { name: 'Laporan (Sheets)', icon: <FileText size={20} /> },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar Kiri */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">AA</div>
          <span className="brand-name">Agungjaya Alum.</span>
        </div>

        <nav className="sidebar-nav">
          {menus.map((menu, idx) => (
            <button 
              key={idx} 
              className={`nav-item ${activeTab === menu.name ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(menu.name)}
            >
              {menu.icon}
              <span>{menu.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={20} />
            <span>Pengaturan</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama Kanan */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Ikhtisar Keuangan</h1>
            <p>Pantau arus kas dan proyek Anda secara real-time.</p>
          </div>
          <div className="header-actions">
             {/* Tempat untuk profile/logout dll */}
             <div className="profile-circle">A</div>
          </div>
        </header>
        
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};
