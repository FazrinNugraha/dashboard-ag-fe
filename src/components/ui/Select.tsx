import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  /** Tampilkan kotak cari di atas daftar (untuk daftar panjang, mis. proyek). */
  searchable?: boolean;
  /** Teks bantuan di kotak cari. */
  searchPlaceholder?: string;
}

/**
 * Select Component
 * Dropdown custom sesuai standar Miro (filter-dropdown):
 * - Pill shape ({rounded.full}), border hairline-strong, typography body-sm-medium
 * - Menu popup dengan shadow level 4 (modal), rounded-md, item hover surface
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  searchable = false,
  searchPlaceholder = 'Cari...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  // Kata kunci pencarian (hanya dipakai bila searchable)
  const [query, setQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuMaxHeight = 320;
    const openUp = spaceBelow < menuMaxHeight + 16 && rect.top > spaceBelow;
    setDropUp(openUp);

    const menuWidth = Math.max(rect.width, 180);
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 16) {
      left = window.innerWidth - 16 - menuWidth;
    }

    setMenuStyle({
      position: 'fixed',
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left,
      minWidth: menuWidth,
      transform: openUp ? 'translateY(-100%)' : 'none',
    });
  };

  useEffect(() => {
    // Saat menu tertutup, kosongkan kata kunci agar pembukaan berikutnya bersih
    if (!isOpen) {
      setQuery('');
      return;
    }

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScrollOrResize = () => updatePosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Opsi yang cocok dengan kata kunci. Opsi bernilai '' (pilihan default seperti
  // "Tanpa proyek") selalu tampil agar tidak hilang saat mencari.
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions =
    searchable && normalizedQuery
      ? options.filter(
          (opt) => opt.value === '' || opt.label.toLowerCase().includes(normalizedQuery)
        )
      : options;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`select-trigger ${isOpen ? 'open' : ''} ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`select-trigger-label ${selectedOption ? '' : 'placeholder'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`select-chevron ${isOpen ? 'rotated' : ''}`}
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={`select-menu ${dropUp ? 'drop-up' : ''}`}
          style={menuStyle}
          role="listbox"
        >
          {searchable && (
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              style={{
                position: 'sticky', top: 0, width: '100%', boxSizing: 'border-box',
                padding: '8px 10px', marginBottom: '4px', fontSize: '13px',
                fontFamily: 'inherit', outline: 'none',
                border: '1px solid var(--color-hairline-strong)',
                borderRadius: 'var(--rounded-md)', backgroundColor: 'var(--color-canvas)',
              }}
            />
          )}
          {filteredOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`select-item ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </button>
          ))}
          {searchable && filteredOptions.length === 0 && (
            <div style={{ padding: '10px', fontSize: '13px', color: 'var(--color-slate)' }}>
              Tidak ditemukan.
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
