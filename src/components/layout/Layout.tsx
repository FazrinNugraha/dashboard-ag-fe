import React, { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Receipt, FileText, LogOut, RefreshCw } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
  pageTitle?: string;
  pageSubtitle?: string;
  username?: string;
}

/**
 * Layout Component
 * Membungkus seluruh aplikasi dengan Sidebar di kiri dan konten utama di kanan.
 * Sangat gampang dibaca karena kita memisahkan list menu ke dalam array.
 */
export const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'Dashboard', onTabChange, pageTitle, pageSubtitle, username }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = (username || '').trim();
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-requested-with': 'XMLHttpRequest' }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Gagal menyinkronkan data.');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-requested-with': 'XMLHttpRequest' }
      });
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

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
          <img 
            src="/logo-icon.png" 
            alt="Logo Agungjaya Aluminium" 
            className="brand-logo-img" 
          />
          <span className="brand-name">AGUNGJAYA ALUMINIUM</span>
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
          <button className="nav-item" onClick={handleLogout} disabled={isLoggingOut} style={{ color: '#d93025' }}>
            <LogOut size={20} />
            <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama Kanan */}
      <main className="main-content">
        <header className="top-header">
          {pageTitle && (
            <div className="header-title">
              <h1>{pageTitle}</h1>
              {pageSubtitle && <p>{pageSubtitle}</p>}
            </div>
          )}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: pageTitle ? undefined : 'auto' }}>
             <button 
                onClick={handleSync} 
                disabled={isSyncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-hairline-strong)',
                  padding: '8px 16px', borderRadius: '24px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)'
                }}
             >
               <RefreshCw size={16} className={isSyncing ? "spin-animation" : ""} />
               {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sheets'}
             </button>
             <div className="profile-circle" title={displayName ? `Login sebagai ${displayName}` : 'Admin'}>
               {initial}
             </div>
          </div>
        </header>
        
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};
