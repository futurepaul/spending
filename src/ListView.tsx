import React from 'react';
import { TreeViewData } from './TreeView';
import { useNavigate } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root';

interface ListViewProps {
  data: TreeViewData[];
  onItemClick?: (id: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ data, onItemClick }) => {
  const navigate = useNavigate();
  const { view } = RootRoute.useSearch();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const formatAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (amount: number) => {
    return `${((amount / total) * 100).toFixed(2)}%`;
  };

  const handleClick = (id: string) => {
    if (onItemClick) {
      onItemClick(id);
    } else if (id) {
      navigate({ 
        to: '/$agency', 
        params: { agency: id },
        search: { view }
      });
    }
  };

  return (
    <div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ textAlign: 'right' }}>Obligated Amount</th>
            <th style={{ textAlign: 'right' }}>Percent of Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id || index}
              onClick={() => item.id && handleClick(item.id)}
              style={{ 
                cursor: item.id ? 'pointer' : 'default',
              }}
            >
              <td>{item.name}</td>
              <td style={{ textAlign: 'right' }}>{formatAmount(item.value)}</td>
              <td style={{ textAlign: 'right' }}>{formatPercent(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 