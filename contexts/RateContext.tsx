import React, { createContext, useContext, useState } from 'react';

const RateContext = createContext<any>(null);

export const useRates = () => {
  const context = useContext(RateContext);
  return context || { rates: {}, loading: false, updateRates: () => {}, resetToDefault: () => {} };
};

interface RateProviderProps {
  children: React.ReactNode;
}

export const RateProvider = ({ children }: RateProviderProps) => {
  const [rates, setRates] = useState({ cement: 400, sand: 55, steel: 68 });
  return React.createElement(RateContext.Provider, { value: { rates, loading: false, updateRates: setRates, resetToDefault: () => {} } }, children);
};
