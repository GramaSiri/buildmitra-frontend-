import React from 'react';
import Letterhead from '../Letterhead';

const ApprovalsBBMP: React.FC = () => (
  <Letterhead title="BBMP / GBA Building Plan Approval – Step by Step">
    <p>For properties within BBMP limits (core Bengaluru), obtain building plan approval from BBMP Town Planning department.</p>
    <h3>📝 Online Process (e‑Aasthi portal)</h3>
    <ol>
      <li>Register at <a href="https://bbmp.gov.in" target="_blank" rel="noopener noreferrer">bbmp.gov.in</a> → "e‑Aasthi" section.</li>
      <li>Upload documents: title deed, khata, tax receipt, architect‑drawn plan, soil test report for &gt;4 floors.</li>
      <li>Pay scrutiny fees and development charges online.</li>
      <li>BBMP officials inspect site (within 15 days).</li>
      <li>Approved plan issued in 30‑60 days (residential) or 60‑90 days (commercial).</li>
    </ol>
    <h3>📄 Documents Required (Offline Submission)</h3>
    <ul>
      <li>Application form (Form A).</li>
      <li>Title deed and latest EC.</li>
      <li>Khata certificate and tax paid receipt.</li>
      <li>Site plan, floor plans, elevation, section drawings (drawn by licensed architect).</li>
      <li>Structural stability certificate (for &gt;2 floors).</li>
      <li>NOC from BMRDA (if applicable).</li>
      <li>Fire NOC (for commercial or high‑rise).</li>
    </ul>
    <h3>📞 Contacts & Escalation</h3>
    <p>BBMP Head Office, N.R. Square, Bengaluru - 560002. Helpline: 080-22221188.<br />For delays, approach Joint Director of Town Planning or file grievance on BBMP website.</p>
  </Letterhead>
);
export default ApprovalsBBMP;