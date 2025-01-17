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
  const { amount } = useUserAmount();

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
    <div>
      {/* Agency/Account information if available */}
      {percentageInfo && (
        <div className="titlebar-info">
          <p>
            {title} spent <strong>{formatDisplayAmount(percentageInfo.amount)}</strong> ({percentageInfo.percentage.toFixed(1)}%
            {percentageInfo.totalPercentage && ` of agency, ${percentageInfo.totalPercentage.toFixed(1)}% of total`})
          </p>
          <p>Your portion: <strong>{formatDisplayAmount(percentageInfo.userPortion)}</strong></p>
        </div>
      )}

      {/* Navigation breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="breadcrumbs">
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