import { useCallback } from 'react';
import { usePaymentBarrier } from './usePaymentBarrier';
import { FeatureType } from '../utils/accessControl';

export function useProtectedAction() {
  const { checkAndRun, isPaymentOpen, blockedFeature } = usePaymentBarrier();

  const protect = useCallback(
    (actionCallback: () => void, featureType: FeatureType = 'calculator_export', referenceCode: string = 'global') => {
      checkAndRun(featureType, referenceCode, actionCallback);
    },
    [checkAndRun]
  );

  return {
    protect,
    checkAndRun,
    isPaymentOpen,
    blockedFeature
  };
}

export default useProtectedAction;
