import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { API_BASE } from '../lib/api';

interface LoginPageProps {
  onSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.detail?.message || errJson.detail || 'Login gagal.');
      }

      // Jika berhasil, token HTTP-only cookie sudah terset di browser.
      const data = await res.json().catch(() => ({}));
      onSuccess(data.username ?? username);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--color-surface)' 
    }}>
      <Card variant="base" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: 'var(--color-brand-yellow)', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--color-primary)'
          }}>AA</div>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Masuk ke Dashboard</h1>
          <p style={{ color: 'var(--color-slate)', marginTop: '8px' }}>Gunakan kredensial admin Anda.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ color: 'var(--color-on-primary)', backgroundColor: 'var(--color-error)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Username</label>
            <Input 
              type="text" 
              required
              placeholder="Fazrin / Nugraha"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Kata Sandi</label>
            <Input 
              type="password" 
              required
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
