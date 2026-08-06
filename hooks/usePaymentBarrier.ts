import React, { createContext, useContext, useState } from "react";

type PaymentBarrierContextType = {
  isOpen: boolean;
  pendingAction: string;
  triggerBarrier: (actionType?: string) => void;
  closeBarrier: () => void;
  setIsOpen: (open: boolean) => void;
};

const defaultState: PaymentBarrierContextType = {
  isOpen: false,
  pendingAction: "PDF",
  triggerBarrier: () => {},
  closeBarrier: () => {},
  setIsOpen: () => {}
};

export const PaymentBarrierContext = createContext<PaymentBarrierContextType>(defaultState);

export function PaymentBarrierProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState("PDF");

  const triggerBarrier = (actionType: string = "PDF") => {
    setPendingAction(actionType);
    setIsOpen(true);
  };

  const closeBarrier = () => {
    setIsOpen(false);
  };

  return (
    <PaymentBarrierContext.Provider value={{ isOpen, pendingAction, triggerBarrier, closeBarrier, setIsOpen }}>
      {children}
    </PaymentBarrierContext.Provider>
  );
}

export function usePaymentBarrier() {
  const context = useContext(PaymentBarrierContext);
  if (!context) {
    return defaultState;
  }
  return context;
}

export default usePaymentBarrier;
