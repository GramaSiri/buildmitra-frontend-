import React from 'react';
import { useProtectedAction } from '../../hooks/useProtectedAction';
import { FeatureType } from '../../utils/accessControl';

interface ProtectedActionProps {
  children: React.ReactElement;
  onAction: () => void;
  featureType?: FeatureType;
  referenceCode?: string;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  onAction,
  featureType = 'calculator_export',
  referenceCode = 'global'
}) => {
  const { protect } = useProtectedAction();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    protect(onAction, featureType, referenceCode);
  };

  return React.cloneElement(children, {
    onClick: handleClick
  });
};

export default ProtectedAction;
