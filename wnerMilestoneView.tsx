import React, { useState, useEffect } from 'react';

const OwnerMilestoneView = () => {
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const p = localStorage.getItem('projectData');
    const m = localStorage.getItem('milestones');
    if (p) setProject(JSON.parse(p));
    if (m) setMilestones(JSON.parse(m));
  }, []);

  const approveMilestone = (id: number) => {
    const updated = milestones.map(m => m.id === id ? { ...m, ownerApproved: true } : m);
    setMilestones(updated);
    localStorage.setItem('milestones', JSON.stringify(updated));
    alert('Milestone approved');
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Owner Dashboard – {project.name}</h1>
      <p>Total Budget: ₹{project.totalBudget}</p>
      <table className="w-full border mt-4">
        <thead className="bg-gray-100"><tr><th>Task</th><th>Status</th><th>% Comp</th><th>Payment Status</th><th>Action</th></tr></thead>
        <tbody>
          {milestones.map(m => (
            <tr key={m.id}>
              <td>{m.description}</td><td>{getStatus(m)}</td><td>{m.percentComplete}%</td><td>{m.paymentStatus}</td>
              <td>{!m.ownerApproved && m.percentComplete > 0 && <button onClick={() => approveMilestone(m.id)} className="btn-primary">Approve</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default OwnerMilestoneView;