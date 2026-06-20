import React from 'react';
import Letterhead from '../Letterhead';

const BuyingRERA: React.FC = () => {
  return (
    <Letterhead title="RERA Rules & Guidelines – Karnataka">
      <p><strong>RERA (Real Estate Regulatory Authority)</strong> rules explained.</p>
      <ul>
        <li>Projects &gt;500 sqm or &gt;8 apartments must register with RERA.</li>
        <li>70% of buyers' money must be in an escrow account.</li>
        <li>Builder cannot change plans without consent.</li>
        <li>Delayed possession → refund with interest.</li>
        <li>RERA Karnataka: <a href="https://rera.karnataka.gov.in" target="_blank">rera.karnataka.gov.in</a></li>
        <li>Office: Shantinagar, Bengaluru. Contact: 080-22992100</li>
      </ul>
      <p><strong>Documents to check before buying:</strong> RERA registration, approved plan, title deed, EC, completion certificate.</p>
    </Letterhead>
  );
};

export default BuyingRERA;