import React from 'react';
import { Link } from '@tanstack/react-router';
import { useUserAmount } from './UserAmountContext';
import fy2024Data from './fy2024.json';

export const Header: React.FC = () => {
  const { amount, setAmount, useUserMoney, setUseUserMoney } = useUserAmount();

  const formatDisplayAmount = (amount: number) => {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)} Trillion`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} Billion`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)} Million`;
    return `$${amount.toLocaleString()}`;
  };

  function setNumberIfNumber(value: string) {
    const number = Number(value);
    if (isNaN(number)) return;
    setAmount(number);
  }

  return (
    <header>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 className="marker">💸 SPENDING.LOL 💸</h1>
      </Link>
      
      <p>
        The US government <s>spent</s> promised <strong>{formatDisplayAmount(fy2024Data.total)}</strong> in 2024
      </p>

      <div>
        <p>How much did you contribute?</p>
        <div>
          <span>$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setNumberIfNumber(e.target.value)}
            className="user-input"
          />
        </div>
        <input
          type="checkbox"
          id="useMyMoney"
          checked={useUserMoney}
          onChange={(e) => setUseUserMoney(e.target.checked)}
        />
        <label htmlFor="useMyMoney">Spend my money!</label>
      </div>
    </header>
  );
}; 