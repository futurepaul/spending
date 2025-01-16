import React, { createContext, useContext, useState } from 'react';

interface UserAmountContextType {
  amount: number;
  setAmount: (amount: number) => void;
  useUserMoney: boolean;
  setUseUserMoney: (useUserMoney: boolean) => void;
}

const UserAmountContext = createContext<UserAmountContextType | undefined>(undefined);

export function UserAmountProvider({ children }: { children: React.ReactNode }) {
  const [amount, setAmount] = useState(1);
  const [useUserMoney, setUseUserMoney] = useState(false);

  return (
    <UserAmountContext.Provider value={{ amount, setAmount, useUserMoney, setUseUserMoney }}>
      {children}
    </UserAmountContext.Provider>
  );
}

export function useUserAmount() {
  const context = useContext(UserAmountContext);
  if (context === undefined) {
    throw new Error('useUserAmount must be used within a UserAmountProvider');
  }
  return context;
} 