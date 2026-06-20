import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [activeMainTab, setActiveMainTab] = useState<'buying' | 'approvals'>('buying');
  const [activeBuyingSub, setActiveBuyingSub] = useState('RERA');
  const [activeApprovalsSub, setActiveApprovalsSub] = useState('BBMP');

  // Buying Guide content (2-3 pages each)
  const buyingContent: Record<string, React.ReactNode> = {
    RERA: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">RERA Rules & Guidelines – Karnataka</h3>
        <p><strong>What is RERA?</strong> The Real Estate (Regulation and Development) Act, 2016, protects home buyers. Every project with land area &gt;500 sqm or &gt;8 apartments MUST register with RERA.</p>
        <h4 className="font-semibold mt-4">Key Points for Buyers:</h4>
        <ul className="list-disc pl-5">
          <li>Builder must display RERA registration number.</li>
          <li>70% of buyers' payments in escrow account.</li>
          <li>No plan changes without buyers' consent.</li>
          <li>Delayed possession → refund with interest.</li>
          <li>Portal: <a href="https://rera.karnataka.gov.in" target="_blank" className="text-indigo-600 underline">rera.karnataka.gov.in</a></li>
        </ul>
        <h4 className="font-semibold mt-4">Documents to Verify:</h4>
        <ul className="list-disc pl-5">
          <li>RERA registration certificate</li>
          <li>Approved building plan</li>
          <li>Title deed & EC (last 30 years)</li>
          <li>Completion / occupancy certificate</li>
        </ul>
        <h4 className="font-semibold mt-4">How to File a Complaint:</h4>
        <ul className="list-disc pl-5">
          <li>Online: RERA portal → "File Complaint"</li>
          <li>Offline: 1st Floor, BMTC Building, Shantinagar, Bengaluru - 560027</li>
          <li>Contact: 080-22992100</li>
        </ul>
      </div>
    ),
    GBA: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">GBA (Greater Bangalore Area) Buying Guide</h3>
        <h4 className="font-semibold mt-4">Pre‑Purchase Checklist:</h4>
        <ul className="list-disc pl-5">
          <li>Land Use Conversion (DC Convert)</li>
          <li>Approved Layout Plan (BBMP/BMRDA)</li>
          <li>Khata Certificate (A‑Khata preferred)</li>
          <li>Encumbrance Certificate (30 years)</li>
          <li>Tax Paid Receipts</li>
          <li>Building Plan Approval</li>
        </ul>
        <h4 className="font-semibold mt-4">Important Contacts:</h4>
        <ul className="list-disc pl-5">
          <li>BBMP: 080-22221188, N.R. Square</li>
          <li>BMRDA: 080-22225779, BMTC Complex, K.H. Road</li>
        </ul>
      </div>
    ),
    BDA: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">BDA (Bangalore Development Authority) Site Buying Guide</h3>
        <h4 className="font-semibold mt-4">Steps to Buy a BDA Site:</h4>
        <ol className="list-decimal pl-5">
          <li>Check BDA website for layouts</li>
          <li>Obtain allotment letter and sale deed</li>
          <li>Verify EC for 30 years</li>
          <li>Ensure property taxes paid</li>
          <li>Transfer khata via BBMP</li>
        </ol>
        <h4 className="font-semibold mt-4">Red Flags:</h4>
        <ul className="list-disc pl-5">
          <li>Sites without BDA notification number</li>
          <li>No layout approval</li>
          <li>Land not converted (agricultural)</li>
        </ul>
        <p><strong>Office:</strong> Kumara Krupa Road, Bengaluru - 560001, Ph: 080-22970100</p>
      </div>
    ),
    BMRDA: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">BMRDA Guide</h3>
        <p>BMRDA regulates areas within 100 km of Bengaluru (e.g., Nelamangala, Anekal, Hoskote).</p>
        <h4 className="font-semibold mt-4">What to Check:</h4>
        <ul className="list-disc pl-5">
          <li>Layout must have BMRDA approval number</li>
          <li>Minimum road width: 12m main, 9m internal</li>
          <li>Recreational area as per zoning</li>
          <li>Underground drainage, water, electricity</li>
          <li>DC conversion for land</li>
        </ul>
        <p><strong>Office:</strong> 2nd Floor, BMTC Complex, K.H. Road, Bengaluru - 560027, Ph: 080-22225779</p>
      </div>
    ),
    Municipal: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">Municipal Gramatan / Town Panchayat Guide</h3>
        <h4 className="font-semibold mt-4">Key Steps Before Buying:</h4>
        <ul className="list-disc pl-5">
          <li>Verify title deed and EC from local sub‑registrar</li>
          <li>Check land use classification</li>
          <li>Get building plan approval from Town Planning Officer</li>
          <li>Ensure seller has paid property tax</li>
          <li>For layouts &gt;1 acre, BMRDA approval mandatory</li>
        </ul>
        <h4 className="font-semibold mt-4">Sample Contacts:</h4>
        <p>Nelamangala Town Panchayat: 080-27732340<br />Kanakapura CMC: 080-27263333</p>
      </div>
    ),
  };

  // Approvals content
  const approvalsContent: Record<string, React.ReactNode> = {
    BBMP: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">BBMP / GBA Building Plan Approval</h3>
        <h4 className="font-semibold mt-4">Online Process (e‑Aasthi):</h4>
        <ol className="list-decimal pl-5">
          <li>Register at <a href="https://bbmp.gov.in" className="text-indigo-600 underline">bbmp.gov.in</a> → e‑Aasthi</li>
          <li>Upload title deed, khata, tax receipt, architect plan, soil test (for &gt;4 floors)</li>
          <li>Pay fees online</li>
          <li>Inspection within 15 days</li>
          <li>Approval in 30‑60 days</li>
        </ol>
        <h4 className="font-semibold mt-4">Documents Required (Offline):</h4>
        <ul className="list-disc pl-5">
          <li>Form A, title deed, EC, khata, tax receipt</li>
          <li>Site plan, floor plans, elevation, section drawings</li>
          <li>Structural stability cert (for &gt;2 floors)</li>
          <li>NOC from BMRDA, Fire NOC if applicable</li>
        </ul>
        <p><strong>Office:</strong> BBMP Head Office, N.R. Square, Bengaluru - 560002, Helpline: 080-22221188</p>
      </div>
    ),
    BDA_Approval: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">BDA Layout & Building Approval</h3>
        <h4 className="font-semibold mt-4">Layout Approval (for developers):</h4>
        <ul className="list-disc pl-5">
          <li>Submit to BDA Town Planning with DC conversion, survey sketch, DPR</li>
          <li>Public notification (30 days)</li>
          <li>Sanction in 60‑120 days</li>
        </ul>
        <h4 className="font-semibold mt-4">Building Plan on BDA Site:</h4>
        <ul className="list-disc pl-5">
          <li>Within BBMP → follow BBMP process</li>
          <li>Peripheral → follow BMRDA</li>
        </ul>
        <p><strong>Office:</strong> BDA, Kumara Krupa Road, Bengaluru - 560001, Ph: 080-22970100</p>
      </div>
    ),
    BMRDA_Approval: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">BMRDA Development Approval</h3>
        <h4 className="font-semibold mt-4">Online via BMRDA One Portal:</h4>
        <ol className="list-decimal pl-5">
          <li>Register on <a href="https://bmrda.karnataka.gov.in" className="text-indigo-600 underline">BMRDA website</a> → One Portal</li>
          <li>Upload land conversion, site plan, structural drawings, NOCs</li>
          <li>Pay development fees</li>
          <li>Inspection (15‑30 days)</li>
          <li>Approval in 30‑60 days</li>
        </ol>
        <h4 className="font-semibold mt-4">Documents:</h4>
        <ul className="list-disc pl-5">
          <li>Land title, EC (30 years)</li>
          <li>DC conversion order</li>
          <li>Layout/building plan</li>
          <li>Soil test for &gt;2 floors</li>
        </ul>
        <p><strong>Contact:</strong> 2nd Floor, BMTC Complex, K.H. Road, Bengaluru - 560027, Ph: 080-22225779</p>
      </div>
    ),
    Municipal_Approval: (
      <div>
        <h3 className="text-xl font-bold text-indigo-800">Town Panchayat / Municipal Council Approval</h3>
        <h4 className="font-semibold mt-4">Step‑by‑Step:</h4>
        <ol className="list-decimal pl-5">
          <li>Visit local Town Panchayat/CMC office (Town Planning)</li>
          <li>Submit title deed, EC, survey map, site plan, building plan, tax receipt</li>
          <li>Pay fees (₹5‑15 per sqft)</li>
          <li>Inspection (7‑15 days)</li>
          <li>Approval within 30‑60 days</li>
        </ol>
        <h4 className="font-semibold mt-4">Special Notes:</h4>
        <ul className="list-disc pl-5">
          <li>For layouts &gt;1 acre, BMRDA approval needed</li>
          <li>Agricultural land needs DC conversion before applying</li>
        </ul>
        <p><strong>Sample:</strong> Nelamangala Town Panchayat: 080-27732340</p>
      </div>
    ),
  };

  const features = [
    { icon: '🏗️', title: 'Civil BOQ', desc: 'Auto‑calculate quantities for excavation, concrete, steel, block work, plaster, flooring, doors & windows.', link: '/civil-boq' },
    { icon: '⚡', title: 'Electrical BOQ', desc: 'Wires, switches, DB, earthing, UPS – based on BUA, rooms, floors, construction type.', link: '/electrical-boq' },
    { icon: '🚰', title: 'Plumbing BOQ', desc: 'Pipes, sanitaryware, OHT, sump, pumps – detailed IS thumb rules.', link: '/plumbing-boq' },
    { icon: '🎨', title: 'Interior BOQ', desc: 'Wardrobe, kitchen, false ceiling, plywood, laminates, hardware.', link: '/interior-boq' },
    { icon: '🏭', title: 'PEB BOQ', desc: 'Pre‑engineered building – steel structure, sheeting, columns, purlins.', link: '/peb-boq' },
    { icon: '🧮', title: 'Material Calculators', desc: 'Staircase, paint, earthwork, RCC steel, wall masonry, flooring, doors & windows.', link: '/staircase-calc' },
    { icon: '🏢', title: 'Real Estate', desc: 'List properties, search, buyer/seller dashboards, admin CRM.', link: '/real-estate' },
    { icon: '🔨', title: 'Vendor & Contractor', desc: 'Register, upload profile/catalog, receive enquiries, reply with quotes.', link: '/vendor-auth' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
            BuildMitra <span className="text-indigo-600">Construction ERP</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            All‑in‑one platform for BOQ generation, material estimation, project tracking, real estate, and vendor management.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/vendor-dashboard" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition">Go to Dashboard</Link>
            <Link to="/innovations" className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition">Explore Innovations</Link>
          </div>
        </div>
      </div>

      {/* Buying Guide & Approvals Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex gap-4 border-b pb-3 mb-4">
            <button
              onClick={() => setActiveMainTab('buying')}
              className={`px-5 py-2 rounded-full font-semibold transition ${activeMainTab === 'buying' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📘 Buying Guide
            </button>
            <button
              onClick={() => setActiveMainTab('approvals')}
              className={`px-5 py-2 rounded-full font-semibold transition ${activeMainTab === 'approvals' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ✅ Approvals
            </button>
          </div>

          {activeMainTab === 'buying' && (
            <div>
              <div className="flex flex-wrap gap-3 mb-5">
                {['RERA', 'GBA', 'BDA', 'BMRDA', 'Municipal'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveBuyingSub(sub)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeBuyingSub === sub ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {sub === 'RERA' && 'RERA Rules'}
                    {sub === 'GBA' && 'GBA'}
                    {sub === 'BDA' && 'BDA'}
                    {sub === 'BMRDA' && 'BMRDA'}
                    {sub === 'Municipal' && 'Municipal / Gramatana'}
                  </button>
                ))}
              </div>
              <div className="border-t pt-4 mt-2 text-gray-700">
                {buyingContent[activeBuyingSub]}
              </div>
            </div>
          )}

          {activeMainTab === 'approvals' && (
            <div>
              <div className="flex flex-wrap gap-3 mb-5">
                {['BBMP', 'BDA_Approval', 'BMRDA_Approval', 'Municipal_Approval'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveApprovalsSub(sub)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${activeApprovalsSub === sub ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {sub === 'BBMP' && 'GBA/BBMP'}
                    {sub === 'BDA_Approval' && 'BDA'}
                    {sub === 'BMRDA_Approval' && 'BMRDA'}
                    {sub === 'Municipal_Approval' && 'Municipal / Gramatana'}
                  </button>
                ))}
              </div>
              <div className="border-t pt-4 mt-2 text-gray-700">
                {approvalsContent[activeApprovalsSub]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Everything you need to manage construction projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <Link key={idx} to={f.link} className="group bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600">{f.title}</h3>
              <p className="text-gray-500 mt-2 text-sm">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your construction workflow?</h2>
          <p className="text-indigo-100 mb-8">Join hundreds of contractors, vendors, and real estate professionals using BuildMitra.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/vendor-auth" className="bg-white text-indigo-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">Register as Vendor</Link>
            <Link to="/real-estate" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-indigo-800 transition">Explore Real Estate</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center text-sm">
        <p>© 2026 BuildMitra – Construction ERP. All rights reserved.</p>
        <p className="mt-2">Empowering construction professionals with smart tools.</p>
      </footer>
    </div>
  );
};

export default HomePage;