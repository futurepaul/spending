import React from 'react';
import { Link } from '@tanstack/react-router';
import { useUserAmount } from './UserAmountContext';
import fy2024Data from './fy2024.json';

interface TitlebarProps {
  title?: string;
  total: number;
  breadcrumbs?: {
    name: string;
    to: string;
    params?: Record<string, string>;
    search?: Record<string, string>;
  }[];
}

export const Titlebar: React.FC<TitlebarProps> = ({ title, total, breadcrumbs = [] }) => {
  const { amount, setAmount, useUserMoney } = useUserAmount();

  const formatDisplayAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} Trillion`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} Billion`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} Million`;
    return `$${amount.toLocaleString()}`;
  };

  const isAgencyView = breadcrumbs.length > 0;

  // Calculate scaled amount for agency view
  const getScaledAmount = () => {
    if (!isAgencyView || !title) return 0;
    const matchingAgency = fy2024Data.results.find(a => a.name === title);
    if (!matchingAgency) return 0;
    
    // Calculate the percentage directly
    const percentage = matchingAgency.amount / fy2024Data.total;
    return amount * percentage;
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
          { title && <span>{title}</span> }
        </div>
      )}
      <h1>💸 SPENDING.LOL 💸</h1>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {isAgencyView ? `${title} spent` : 'The US government spent'}
      </div>
      <h1>{formatDisplayAmount(total)}</h1>
      <div style={{ fontSize: '2rem', margin: '2rem 0 1rem' }}>
        {isAgencyView ? 'Your contribution to this agency:' : 'How much did you contribute?'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {isAgencyView ? (
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {formatDisplayAmount(getScaledAmount())}
          </div>
        ) : (
          <>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>$</span>
            <input
              type="text"
              value={amount}
              placeholder="0.00"
              onChange={(e) => {
                setAmount(Number(e.target.value))
              }}
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                width: '200px',
                border: '1px solid #ccc',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
            />
          </>
        )}
      </div>
      {isAgencyView && useUserMoney && amount > 0 && (
        <div style={{ fontSize: '1.5rem', marginTop: '1rem', opacity: 0.8 }}>
          This is your contribution scaled by this agency's percentage of the total budget
        </div>
      )}
    </div>
  );
}; 