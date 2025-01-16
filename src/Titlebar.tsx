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
  const { amount, setAmount, useUserMoney, setUseUserMoney } = useUserAmount();

  const formatDisplayAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} Trillion`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} Billion`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} Million`;
    return `$${amount.toLocaleString()}`;
  };

  // Calculate percentages for agency and account views
  const getPercentageInfo = () => {
    if (!title) return null;

    // For agency view
    const matchingAgency = fy2024Data.results.find(a => a.name === title);
    if (matchingAgency) {
      const percentage = (matchingAgency.amount / fy2024Data.total) * 100;
      const userPortion = amount * (percentage / 100);
      return {
        amount: matchingAgency.amount,
        percentage,
        userPortion
      };
    }

    // For account view (if we're in an account and have breadcrumbs)
    if (breadcrumbs.length > 1) {
      const agencyName = breadcrumbs[1].name;
      const matchingAgency = fy2024Data.results.find(a => a.name === agencyName);
      if (matchingAgency) {
        const accountPercentage = (total / matchingAgency.amount) * 100;
        const totalPercentage = (total / fy2024Data.total) * 100;
        const userPortion = amount * (totalPercentage / 100);
        return {
          amount: total,
          percentage: accountPercentage,
          totalPercentage,
          userPortion
        };
      }
    }

    return null;
  };

  const percentageInfo = getPercentageInfo();

  return (
    <div style={{ textAlign: 'left', padding: '1rem' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
      <h1>💸 SPENDING.LOL 💸</h1>
        </a>
      
      {/* Always show total government spending */}
      <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        The US government spent {formatDisplayAmount(fy2024Data.total)}
      </div>

      {/* User contribution input */}
      <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        <div>How much did you contribute?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              fontSize: '1.2rem',
              width: '200px',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            id="useMyMoney"
            checked={useUserMoney}
            onChange={(e) => setUseUserMoney(e.target.checked)}
          />
          <label htmlFor="useMyMoney">Spend my money!</label>
        </div>
      </div>

      {/* Agency/Account information if available */}
      {percentageInfo && (
        <div style={{ fontSize: '1.2rem' }}>
          <div>
            {title} spent {formatDisplayAmount(percentageInfo.amount)} ({percentageInfo.percentage.toFixed(1)}%
            {percentageInfo.totalPercentage && ` of agency, ${percentageInfo.totalPercentage.toFixed(1)}% of total`})
          </div>
          <div>Your portion: {formatDisplayAmount(percentageInfo.userPortion)}</div>
        </div>
      )}

      {/* Navigation breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
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
          {title && (
            <>
              <span style={{ margin: '0 0.5rem' }}>&gt;</span>
              <span>{title}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 