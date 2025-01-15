import React from 'react';

interface TitlebarProps {
  title: string;
  total: number;
}

export const Titlebar: React.FC<TitlebarProps> = ({ title, total }) => {
  const formatAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} Trillion`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} Billion`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} Million`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>Choose an agency below to start your exploration.</p>
      <div>
        <div>FY 2024 OBLIGATED AMOUNT</div>
        <div>{formatAmount(total)}</div>
        <div>Data as of September 29, 2024</div>
      </div>
    </div>
  );
}; 