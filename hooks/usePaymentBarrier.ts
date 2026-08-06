import { useState } from "react";

export function usePaymentBarrier() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string>("PDF");

  const triggerBarrier = (actionType: string = "PDF") => {
    setPendingAction(actionType);
    setIsOpen(true);
  };

  const closeBarrier = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    pendingAction,
    triggerBarrier,
    closeBarrier,
    setIsOpen
  };
}

export default usePaymentBarrier;
