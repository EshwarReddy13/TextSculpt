'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'phosphor-react';

interface WebHeaderProps {
  onColorChange: (colorClass: string) => void;
  activeColor: string;
}

const colorSwatches = [
  { name: 'Default', class: 'bg-white dark:bg-gray-900' },
  { name: 'Slate', class: 'bg-slate-100 dark:bg-slate-800' },
  { name: 'Stone', class: 'bg-stone-100 dark:bg-stone-800' },
  { name: 'Zinc', class: 'bg-zinc-100 dark:bg-zinc-800' },
];

export const WebHeader = ({ onColorChange, activeColor }: WebHeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">TextSculpt</h1>
        
        <div className="flex items-center gap-6">
          {/* Color Swatches */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Editor BG:</span>
            {colorSwatches.map((swatch) => (
              <button
                key={swatch.name}
                onClick={() => onColorChange(swatch.class)}
                className={`w-6 h-6 rounded-full transition-transform duration-150 ${swatch.class.split(' ')[0]} ${activeColor === swatch.class ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' : 'hover:scale-110'}`}
                title={swatch.name}
              />
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}; 