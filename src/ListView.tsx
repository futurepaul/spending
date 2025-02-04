import React from 'react';
import { TreeViewData } from './TreeView';
import { useNavigate } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root';
import { useUserAmount } from './UserAmountContext';
import { calculatePercentage } from './budgetMath';

// Total budget constant
const TOTAL_BUDGET = 9.7e12; // 9.7T

interface ListViewProps {
  data: TreeViewData[];
  onItemClick?: (item: TreeViewData) => void;
  parentPercentage?: number;
}

export const ListView: React.FC<ListViewProps> = ({ data, onItemClick, parentPercentage }) => {
  const navigate = useNavigate();
  const { view } = RootRoute.useSearch();
  const { amount: userAmount, useUserMoney } = useUserAmount();

  const formatAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (amount: number) => {
    return `${calculatePercentage(amount, TOTAL_BUDGET).toFixed(2)}%`;
  };

  const calculateUserAmount = (value: number) => {
    if (!useUserMoney || userAmount === 0) return null;
    return userAmount * (value / TOTAL_BUDGET);
  };

  const handleClick = (item: TreeViewData) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.id && !parentPercentage) {
      navigate({ 
        to: '/agency/$agencyId', 
        params: { agencyId: item.id },
        search: { view }
      });
    }
  };

  return (
    <div className="list-view-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Obligated Amount</th>
            <th>Percent of Total</th>
            {useUserMoney && <th>Your Contribution</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id || index}
              onClick={() => item.id && handleClick(item)}
              style={{ 
                cursor: (onItemClick || !parentPercentage) && item.id ? 'pointer' : 'default',
              }}
            >
              <td>{item.name}</td>
              <td>{formatAmount(item.value)}</td>
              <td>{formatPercent(item.value)}</td>
              {useUserMoney && (
                <td>
                  {formatAmount(calculateUserAmount(item.value) || 0)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 