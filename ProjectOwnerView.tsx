import React, { useState, useEffect } from 'react';

const ProjectOwnerView = () => {
  const [activities, setActivities] = useState([]);
  const [selectedProject, setSelectedProject] = useState('PROJ-001');
  const [reportSummary, setReportSummary] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('dailyActivities');
    if (stored) setActivities(JSON.parse(stored));
  }, []);

  const filtered = activities.filter(a => a.projectId === selectedProject);

  const generateSummary = () => {
    let milestoneText = '', paymentTotal = 0;
    filtered.forEach(a => {
      if (a.milestone) milestoneText += `- ${a.milestone} (${a.date})\n`;
      if (a.payment) {
        const match = a.payment.match(/\d+/);
        if (match) paymentTotal += parseInt(match[0], 10);
      }
    });
    setReportSummary(`Project ${selectedProject}\nCompleted milestones:\n${milestoneText}\nEstimated payments: ₹${paymentTotal}\nTotal entries: ${filtered.length}`);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Milestone', 'Inventory', 'Work Update', 'Payment', 'Snag List'];
    const rows = filtered.map(a => [a.date, a.milestone, a.inventory, a.workUpdate, a.payment, a.snagList]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owner_report_${selectedProject}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">👑 Project Owner Dashboard</h1>
      <p className="text-gray-600 mb-6">View daily reports from site engineer / contractor</p>

      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-end">
        <div><label className="block font-semibold">Select Project</label><select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input-field"><option value="PROJ-001">Green Valley</option><option value="PROJ-002">Sai Residency</option></select></div>
        <button onClick={generateSummary} className="btn-secondary">Generate Summary</button>
        <button onClick={exportToCSV} className="btn-primary">Export to CSV</button>
      </div>

      {reportSummary && <div className="bg-blue-50 p-4 rounded-xl mb-6 whitespace-pre-wrap">{reportSummary}</div>}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3">Date</th><th>Milestone</th><th>Inventory</th><th>Work Update</th><th>Payment</th><th>Snag List</th></tr></thead>
          <tbody>{filtered.map(a => <tr key={a.id} className="border-b"><td className="p-3">{a.date}</td><td>{a.milestone}</td><td>{a.inventory}</td><td>{a.workUpdate}</td><td>{a.payment}</td><td>{a.snagList}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectOwnerView;