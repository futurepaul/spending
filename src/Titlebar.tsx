import React from 'react';
import { Link } from '@tanstack/react-router';

interface TitlebarProps {
  title: string;
  total: number;
  breadcrumbs?: {
    name: string;
    to: string;
    params?: Record<string, string>;
    search?: Record<string, string>;
  }[];
}

export const Titlebar: React.FC<TitlebarProps> = ({ title, total, breadcrumbs = [] }) => {
  const formatAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} Trillion`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} Billion`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} Million`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div>
      {breadcrumbs.length > 0 && (
        <div>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.to}>
              {index > 0 && <span style={{ margin: '0 0.5rem' }}>&gt;</span>}
              <Link
                to={crumb.to}
                params={crumb.params}
                search={crumb.search}
              >
                {crumb.name}
              </Link>
            </span>
          ))}
          <span style={{ margin: '0 0.5rem' }}>&gt;</span>
          <span>{title}</span>
        </div>
      )}
      <h1>{title}</h1>
      <h2>{formatAmount(total)}</h2>
      <div>FY 2024 OBLIGATED AMOUNT</div>
      <div>Data as of September 29, 2024</div>
    </div>
  );
}; 