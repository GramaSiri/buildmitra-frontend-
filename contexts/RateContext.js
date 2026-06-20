import React from 'react';
export const RateContext = React.createContext(null);
export const useRates = () => ({ rates: {}, loading: false });
export const RateProvider = ({ children }) => React.createElement(RateContext.Provider, { value: {} }, children);
