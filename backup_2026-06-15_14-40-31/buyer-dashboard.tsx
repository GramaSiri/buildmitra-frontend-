import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExtraWorkModal, setShowExtraWorkModal] = useState(false);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [showLabourPaymentModal, setShowLabourPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [chequeNo, setChequeNo] = useState("");
  const [utrNo, setUtrNo] = useState("");
  const [actualPaymentAmount, setActualPaymentAmount] = useState("");
  const [reportType, setReportType] = useState("milestones");
  const [reportFilters, setReportFilters] = useState({ startDate: "", endDate: "", supplier: "", contractor: "", material: "", labourName: "", role: "" });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState("photo");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);
  const [extraWork, setExtraWork] = useState({ description: "", quantity: "", rate: "", amount: "", unit: "Nos", status: "Pending" });
  const [newLabour, setNewLabour] = useState({ name: "", role: "", dailyWage: "", daysPresent: "", paymentAmount: "", status: "Present" });
  const [labourPaymentHistory, setLabourPaymentHistory] = useState([]);

  const calculateBUA = (length: number, width: number, floors: number) => {
    const setback = (length + width) / 2 * 0.1;
    const effectiveLength = length - setback;
    const effectiveWidth = width - setback;
    return Math.round(effectiveLength * effectiveWidth * floors);
  };

  const getStandardMilestones = () => {
    return [
      { id: 1, name: "Site Clearance & Demolition", percentage: 0.5, phase: "Site Prep", standardDays: 5 },
      { id: 2, name: "Soil Investigation & Geotechnical Report", percentage: 0.3, phase: "Design", standardDays: 7 },
      { id: 3, name: "Topographic Survey & Marking", percentage: 0.2, phase: "Design", standardDays: 3 },
      { id: 4, name: "Excavation for Foundation", percentage: 2.0, phase: "Foundation", standardDays: 7 },
      { id: 5, name: "PCC Bed for Foundation", percentage: 1.0, phase: "Foundation", standardDays: 3 },
      { id: 6, name: "Foundation Reinforcement (Steel)", percentage: 2.5, phase: "Foundation", standardDays: 5 },
      { id: 7, name: "Foundation Shuttering", percentage: 1.5, phase: "Foundation", standardDays: 4 },
      { id: 8, name: "Foundation Concreting", percentage: 3.0, phase: "Foundation", standardDays: 3 },
      { id: 9, name: "Backfilling & Compaction", percentage: 1.0, phase: "Foundation", standardDays: 5 },
      { id: 10, name: "Plinth Beam Work", percentage: 3.5, phase: "Structure", standardDays: 8 },
      { id: 11, name: "Ground Floor Column Casting", percentage: 2.5, phase: "Structure", standardDays: 5 },
      { id: 12, name: "Ground Floor Slab Shuttering", percentage: 2.0, phase: "Structure", standardDays: 6 },
      { id: 13, name: "Ground Floor Reinforcement", percentage: 3.0, phase: "Structure", standardDays: 5 },
      { id: 14, name: "Ground Floor Concreting", percentage: 4.0, phase: "Structure", standardDays: 3 },
      { id: 15, name: "First Floor Column Casting", percentage: 2.5, phase: "Structure", standardDays: 5 },
      { id: 16, name: "First Floor Slab Work", percentage: 6.0, phase: "Structure", standardDays: 12 },
      { id: 17, name: "Second Floor Column Casting", percentage: 2.5, phase: "Structure", standardDays: 5 },
      { id: 18, name: "Second Floor Slab Work", percentage: 6.0, phase: "Structure", standardDays: 12 },
      { id: 19, name: "Brick Masonry Work", percentage: 6.0, phase: "Masonry", standardDays: 15 },
      { id: 20, name: "Plastering - Internal", percentage: 3.0, phase: "Plastering", standardDays: 8 },
      { id: 21, name: "Plastering - External", percentage: 3.0, phase: "Plastering", standardDays: 8 },
      { id: 22, name: "Flooring & Tiling", percentage: 5.0, phase: "Finishing", standardDays: 12 },
      { id: 23, name: "Plumbing - Rough-in", percentage: 2.0, phase: "MEP", standardDays: 7 },
      { id: 24, name: "Electrical Conduiting & Wiring", percentage: 2.5, phase: "MEP", standardDays: 10 },
      { id: 25, name: "False Ceiling Work", percentage: 2.0, phase: "Finishing", standardDays: 7 },
      { id: 26, name: "Woodwork & Joinery", percentage: 4.0, phase: "Finishing", standardDays: 12 },
      { id: 27, name: "Painting - Primer & Putty", percentage: 2.5, phase: "Finishing", standardDays: 8 },
      { id: 28, name: "Painting - Final Coat", percentage: 3.0, phase: "Finishing", standardDays: 8 },
      { id: 29, name: "Fittings & Fixtures Installation", percentage: 3.0, phase: "Finishing", standardDays: 10 },
      { id: 30, name: "Cleaning & Handover", percentage: 2.0, phase: "Completion", standardDays: 5 }
    ];
  };

  const generateMilestones = (startDate: string, endDate: string, totalAmount: number, projectFloors: number) => {
    const standards = getStandardMilestones();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let filteredMilestones = [...standards];
    if (projectFloors === 1) {
      filteredMilestones = filteredMilestones.filter(m => 
        !m.name.includes("First Floor") && !m.name.includes("Second Floor")
      );
    } else if (projectFloors === 2) {
      filteredMilestones = filteredMilestones.filter(m => 
        !m.name.includes("Second Floor")
      );
    }
    
    let cumulativeDays = 0;
    const totalPercentage = filteredMilestones.reduce((sum, m) => sum + m.percentage, 0);
    
    return filteredMilestones.map((milestone, idx) => {
      const daysAllocated = Math.round((milestone.percentage / totalPercentage) * totalDays);
      const plannedStart = new Date(start);
      plannedStart.setDate(start.getDate() + cumulativeDays);
      const plannedEnd = new Date(plannedStart);
      plannedEnd.setDate(plannedEnd.getDate() + daysAllocated);
      cumulativeDays += daysAllocated;
      
      return {
        id: idx + 1,
        name: milestone.name,
        phase: milestone.phase,
        percentage: milestone.percentage,
        amount: (totalAmount * milestone.percentage) / 100,
        plannedStartDate: plannedStart.toISOString().split("T")[0],
        plannedEndDate: plannedEnd.toISOString().split("T")[0],
        status: "Pending",
        contractorStatus: "Pending",
        ownerApproved: false,
        invoiceRaised: false,
        paymentReleased: false,
        actualPaymentAmount: 0,
        paymentDate: null,
        chequeNo: "",
        utrNo: ""
      };
    });
  };

  const [projects, setProjects] = useState([
    { 
      id: 1, 
      name: "Sunrise Villa", 
      plotLength: 50, 
      plotWidth: 40, 
      floors: 2, 
      bua: 0, 
      ratePerSft: 1800, 
      totalAmount: 0, 
      contractorName: "Sharma Construction", 
      contractorMobile: "+919876511111", 
      contractorAddress: "Andheri, Mumbai",
      agreementFile: null,
      agreementUrl: null,
      startDate: "2024-01-01", 
      endDate: "2024-12-31", 
      progress: 0, 
      status: "Planning", 
      milestones: [], 
      payments: [], 
      inventory: [], 
      media: [],
      extraWorks: [],
      labour: []
    }
  ]);

  const [newProject, setNewProject] = useState({ 
    name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, 
    bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", 
    contractorAddress: "", startDate: "", endDate: "", agreementFile: null 
  });
  
  const [inventory, setInventory] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ material: "", unit: "bags", supplier: "", receivedQty: "", invoiceNo: "" });
  const [siteMedia, setSiteMedia] = useState([]);

  React.useEffect(() => {
    if (projects[0] && projects[0].milestones.length === 0) {
      const bua = calculateBUA(projects[0].plotLength, projects[0].plotWidth, projects[0].floors);
      const totalAmount = bua * projects[0].ratePerSft;
      const milestones = generateMilestones(projects[0].startDate, projects[0].endDate, totalAmount, projects[0].floors);
      setProjects([{ ...projects[0], bua, totalAmount, milestones }]);
    }
  }, []);

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const projectMilestones = selectedProjectData?.milestones || [];
  const projectPayments = selectedProjectData?.payments || [];
  const projectInventory = inventory.filter(i => i.projectId === selectedProject);
  const projectMedia = siteMedia.filter(m => m.projectId === selectedProject);
  const projectExtraWorks = selectedProjectData?.extraWorks || [];
  const projectLabour = selectedProjectData?.labour || [];
  
  const completedMilestones = projectMilestones.filter((m: any) => m.status === "Completed").length;
  const progressPercent = projectMilestones.length ? (completedMilestones / projectMilestones.length) * 100 : 0;
  const totalPaid = projectPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalContractAmount = selectedProjectData?.totalAmount || 0;
  const totalExtraWorkAmount = projectExtraWorks.reduce((sum: number, w: any) => sum + (w.amount || 0), 0);
  const grandTotalAmount = totalContractAmount + totalExtraWorkAmount;
  const balanceAmount = grandTotalAmount - totalPaid;

  const addProject = () => {
    if (!newProject.name || !newProject.plotLength || !newProject.plotWidth) { 
      alert("Please fill all required fields"); 
      return; 
    }
    if (!newProject.startDate || !newProject.endDate) { 
      alert("Please select start date and end date"); 
      return; 
    }
    
    const bua = calculateBUA(newProject.plotLength, newProject.plotWidth, newProject.floors);
    const totalAmount = bua * newProject.ratePerSft;
    const milestones = generateMilestones(newProject.startDate, newProject.endDate, totalAmount, newProject.floors);
    
    let agreementUrl = null;
    if (agreementFile) {
      agreementUrl = URL.createObjectURL(agreementFile);
    }
    
    setProjects([...projects, { 
      id: projects.length + 1, 
      ...newProject, 
      bua, 
      totalAmount, 
      progress: 0, 
      status: "Planning", 
      milestones, 
      payments: [], 
      inventory: [], 
      media: [],
      extraWorks: [],
      labour: [],
      agreementUrl: agreementUrl
    }]);
    
    setNewProject({ 
      name: "", plotLength: 0, plotWidth: 0, floors: 1, ratePerSft: 1800, 
      bua: 0, totalAmount: 0, contractorName: "", contractorMobile: "", 
      contractorAddress: "", startDate: "", endDate: "", agreementFile: null 
    });
    setAgreementFile(null);
    setShowAddProject(false);
    alert("Project created with " + milestones.length + " milestones!");
  };

  const updateMilestoneStatus = (milestoneId: number, newStatus: string) => {
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      milestones: p.milestones.map((m: any) => 
        m.id === milestoneId ? { ...m, contractorStatus: newStatus } : m
      )
    } : p));
    alert("Milestone status updated by contractor. Awaiting owner approval.");
  };

  const approveMilestone = (milestone: any) => {
    if (!milestone.ownerApproved) {
      setProjects(projects.map(p => p.id === selectedProject ? {
        ...p,
        milestones: p.milestones.map((m: any) => 
          m.id === milestone.id ? { ...m, ownerApproved: true, status: "Completed" } : m
        ),
        progress: Math.round((p.milestones.filter((m: any) => m.id === milestone.id ? true : m.status === "Completed").length) / p.milestones.length * 100)
      } : p));
      alert("Milestone approved! Contractor can now raise invoice.");
    }
  };

  const raiseInvoice = (milestone: any) => {
    if (milestone.ownerApproved && !milestone.invoiceRaised) {
      setProjects(projects.map(p => p.id === selectedProject ? {
        ...p,
        milestones: p.milestones.map((m: any) => 
          m.id === milestone.id ? { ...m, invoiceRaised: true } : m
        )
      } : p));
      setShowInvoiceModal(true);
      setSelectedMilestone(milestone);
    }
  };

  const releasePayment = () => {
    if (!chequeNo && !utrNo) { 
      alert("Please enter Cheque Number or UTR Number"); 
      return; 
    }
    
    const paymentAmountValue = actualPaymentAmount ? parseFloat(actualPaymentAmount) : (selectedMilestone?.amount || 0);
    
    if (paymentAmountValue > (selectedMilestone?.amount || 0)) {
      alert("Payment amount cannot exceed milestone amount");
      return;
    }
    
    const payment = { 
      id: projectPayments.length + 1, 
      milestoneId: selectedMilestone?.id, 
      milestoneName: selectedMilestone?.name, 
      amount: paymentAmountValue,
      originalAmount: selectedMilestone?.amount,
      date: new Date().toISOString().split("T")[0], 
      status: paymentAmountValue >= (selectedMilestone?.amount || 0) ? "Fully Paid" : "Partially Paid",
      chequeNo: chequeNo, 
      utrNo: utrNo 
    };
    
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      milestones: p.milestones.map((m: any) => 
        m.id === selectedMilestone?.id ? { 
          ...m, 
          paymentReleased: true, 
          paymentDate: new Date().toISOString().split("T")[0],
          chequeNo, 
          utrNo,
          actualPaymentAmount: paymentAmountValue,
          remainingAmount: (selectedMilestone?.amount || 0) - paymentAmountValue,
          paymentStatus: paymentAmountValue >= (selectedMilestone?.amount || 0) ? "Fully Paid" : "Partially Paid"
        } : m
      ),
      payments: [...p.payments, payment]
    } : p));
    
    setChequeNo(""); 
    setUtrNo(""); 
    setActualPaymentAmount("");
    setShowPaymentModal(false);
    setShowInvoiceModal(false);
    alert(`Payment released for ${selectedMilestone?.name}`);
  };

  const sharePayment = (payment: any) => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = `*PAYMENT DETAILS - ${selectedProjectData?.name}*%0A%0AMilestone: ${payment.milestoneName}%0AAmount: ₹${(payment.amount/1000).toFixed(0)}K%0ADate: ${payment.date}%0AReference: ${payment.chequeNo || payment.utrNo}`;
    window.open(`https://wa.me/${mobile}?text=${message}`, "_blank");
  };

  const addMaterial = () => {
    if (!newMaterial.material || !newMaterial.receivedQty) { 
      alert("Enter material name and received quantity"); 
      return; 
    }
    const receivedQty = parseFloat(newMaterial.receivedQty);
    setInventory([...inventory, { 
      id: inventory.length + 1, 
      projectId: selectedProject, 
      materialCode: "MAT-" + String(inventory.length + 1).padStart(3, "0"),
      material: newMaterial.material, 
      receivedQty: receivedQty, 
      consumed: 0, 
      balance: receivedQty, 
      unit: newMaterial.unit, 
      supplier: newMaterial.supplier, 
      invoiceNo: newMaterial.invoiceNo,
      receivedDate: new Date().toISOString().split("T")[0] 
    }]);
    setNewMaterial({ material: "", unit: "bags", supplier: "", receivedQty: "", invoiceNo: "" });
    setShowMaterialModal(false);
    alert("Material recorded!");
  };

  const updateConsumed = (id: number, consumed: string) => {
    const item = inventory.find(i => i.id === id);
    const consumedQty = parseFloat(consumed);
    if (item && !isNaN(consumedQty) && consumedQty >= 0 && consumedQty <= item.receivedQty) {
      setInventory(inventory.map(i => i.id === id ? { 
        ...i, 
        consumed: consumedQty, 
        balance: item.receivedQty - consumedQty 
      } : i));
    }
  };

  const uploadMedia = () => {
    if (!mediaTitle) { alert("Enter title"); return; }
    const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : null;
    setSiteMedia([...siteMedia, { 
      id: siteMedia.length + 1, 
      projectId: selectedProject, 
      type: mediaType, 
      title: mediaTitle, 
      url: mediaUrl, 
      date: new Date().toISOString().split("T")[0] 
    }]);
    setMediaTitle(""); 
    setMediaFile(null); 
    setMediaPreview(null); 
    setMediaType("photo"); 
    setShowMediaModal(false);
    alert("Media uploaded!");
  };

  const addExtraWork = () => {
    if (!extraWork.description || !extraWork.quantity || !extraWork.rate) {
      alert("Please fill all extra work details");
      return;
    }
    const amount = parseFloat(extraWork.quantity) * parseFloat(extraWork.rate);
    const newExtraWork = {
      id: projectExtraWorks.length + 1,
      description: extraWork.description,
      quantity: parseFloat(extraWork.quantity),
      unit: extraWork.unit,
      rate: parseFloat(extraWork.rate),
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      status: "Pending Owner Approval"
    };
    
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      extraWorks: [...(p.extraWorks || []), newExtraWork]
    } : p));
    
    setExtraWork({ description: "", quantity: "", rate: "", amount: "", unit: "Nos", status: "Pending" });
    setShowExtraWorkModal(false);
    alert("Extra work request submitted. Awaiting owner approval.");
  };

  const approveExtraWork = (workId: number) => {
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      extraWorks: p.extraWorks?.map((w: any) => 
        w.id === workId ? { ...w, status: "Approved by Owner" } : w
      )
    } : p));
    alert("Extra work approved!");
  };

  const addLabour = () => {
    if (!newLabour.name || !newLabour.role || !newLabour.dailyWage) {
      alert("Please fill labour name, role and daily wage");
      return;
    }
    
    const newLabourEntry = {
      id: (projectLabour?.length || 0) + 1,
      name: newLabour.name,
      role: newLabour.role,
      dailyWage: parseFloat(newLabour.dailyWage),
      daysPresent: parseInt(newLabour.daysPresent) || 0,
      totalPayment: (parseFloat(newLabour.dailyWage) * (parseInt(newLabour.daysPresent) || 0)),
      status: newLabour.status,
      joinDate: new Date().toISOString().split("T")[0]
    };
    
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      labour: [...(p.labour || []), newLabourEntry]
    } : p));
    
    setNewLabour({ name: "", role: "", dailyWage: "", daysPresent: "", paymentAmount: "", status: "Present" });
    setShowLabourModal(false);
    alert("Labour added successfully!");
  };

  const updateLabourAttendance = (labourId: number, daysPresent: string) => {
    setProjects(projects.map(p => p.id === selectedProject ? {
      ...p,
      labour: p.labour?.map((l: any) => l.id === labourId ? {
        ...l,
        daysPresent: parseInt(daysPresent),
        totalPayment: l.dailyWage * parseInt(daysPresent)
      } : l)
    } : p));
  };

  const makeLabourPayment = () => {
    if (!selectedLabour) return;
    if (!chequeNo && !utrNo) {
      alert("Please enter Cheque or UTR number");
      return;
    }
    
    const paymentAmount = parseFloat(selectedLabour.totalPayment);
    const payment = {
      id: (labourPaymentHistory.length + 1),
      labourId: selectedLabour.id,
      labourName: selectedLabour.name,
      amount: paymentAmount,
      date: new Date().toISOString().split("T")[0],
      chequeNo: chequeNo,
      utrNo: utrNo,
      month: new Date().toLocaleString('default', { month: 'long' })
    };
    
    setLabourPaymentHistory([...labourPaymentHistory, payment]);
    
    setChequeNo("");
    setUtrNo("");
    setShowLabourPaymentModal(false);
    alert(`Payment of ₹${paymentAmount} released to ${selectedLabour.name}`);
  };

  const generateReport = () => {
    let data: any[] = [];
    if (reportType === "milestones") {
      data = projectMilestones.filter((m: any) => {
        if (reportFilters.startDate && m.plannedEndDate < reportFilters.startDate) return false;
        if (reportFilters.endDate && m.plannedEndDate > reportFilters.endDate) return false;
        return true;
      }).map((m: any) => ({ 
        Milestone: m.name, 
        Phase: m.phase,
        Amount: m.amount, 
        ContractorStatus: m.contractorStatus,
        OwnerApproved: m.ownerApproved ? "Yes" : "No",
        InvoiceRaised: m.invoiceRaised ? "Yes" : "No",
        PaymentReleased: m.paymentReleased ? "Yes" : "No",
        DueDate: m.plannedEndDate 
      }));
    } else if (reportType === "payments") {
      data = projectPayments.map((p: any) => ({ 
        Milestone: p.milestoneName, 
        Amount: p.amount, 
        Date: p.date, 
        Reference: p.chequeNo || p.utrNo 
      }));
    } else if (reportType === "inventory") {
      data = projectInventory.filter((i: any) => {
        if (reportFilters.supplier && i.supplier !== reportFilters.supplier) return false;
        if (reportFilters.material && i.material !== reportFilters.material) return false;
        return true;
      }).map((i: any) => ({ 
        Code: i.materialCode, 
        Material: i.material, 
        Received: i.receivedQty, 
        Consumed: i.consumed, 
        Balance: i.balance, 
        Supplier: i.supplier 
      }));
    } else if (reportType === "extrawork") {
      data = projectExtraWorks.map((w: any) => ({
        Description: w.description,
        Quantity: w.quantity,
        Unit: w.unit,
        Rate: w.rate,
        Amount: w.amount,
        Status: w.status,
        Date: w.date
      }));
    } else if (reportType === "labour") {
      data = projectLabour.filter((l: any) => {
        if (reportFilters.labourName && !l.name.toLowerCase().includes(reportFilters.labourName.toLowerCase())) return false;
        if (reportFilters.role && !l.role.toLowerCase().includes(reportFilters.role.toLowerCase())) return false;
        return true;
      }).map((l: any) => ({
        Name: l.name,
        Role: l.role,
        DailyWage: l.dailyWage,
        DaysPresent: l.daysPresent,
        TotalPayment: l.totalPayment,
        Status: l.status,
        JoinDate: l.joinDate
      }));
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);
    XLSX.writeFile(wb, reportType + "_report_" + new Date().toISOString().split("T")[0] + ".xlsx");
    setShowReportModal(false);
    alert("Report downloaded!");
  };

  const shareWhatsApp = () => {
    const mobile = selectedProjectData?.contractorMobile;
    if (!mobile) return;
    const message = `🏗️ PROJECT UPDATE - ${selectedProjectData?.name}%0A%0A📊 Progress: ${progressPercent.toFixed(0)}%%0A💰 Paid: ₹${(totalPaid/100000).toFixed(1)}L%0A📉 Balance: ₹${(balanceAmount/100000).toFixed(1)}L%0A✅ Milestones: ${completedMilestones}/${projectMilestones.length}`;
    window.open(`https://wa.me/${mobile}?text=${message}`, "_blank");
  };

  const styles = {
    container: { padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" },
    header: { backgroundColor: "#800020", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" },
    headerTitle: { margin: 0, fontSize: "20px" },
    headerSub: { margin: "5px 0 0", fontSize: "12px", opacity: 0.9 },
    tabContainer: { display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "1px solid #ddd", flexWrap: "wrap", backgroundColor: "white", padding: "0 16px", borderRadius: "12px 12px 0 0" },
    tab: { padding: "12px 20px", cursor: "pointer", borderBottom: "3px solid transparent", fontSize: "14px", fontWeight: "500" },
    activeTab: { borderBottomColor: "#800020", color: "#800020" },
    card: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    cardTitle: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px", borderBottom: "2px solid #800020", paddingBottom: "10px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px", marginBottom: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "20px" },
    button: { backgroundColor: "#800020", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
    buttonSuccess: { backgroundColor: "#28a745", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonWarning: { backgroundColor: "#ffc107", color: "#333", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonInfo: { backgroundColor: "#17a2b8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    buttonDanger: { backgroundColor: "#dc3545", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", overflowX: "auto" },
    th: { textAlign: "left", padding: "12px", borderBottom: "1px solid #ddd", backgroundColor: "#f8f9fa" },
    td: { padding: "12px", borderBottom: "1px solid #eee" },
    input: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    label: { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "12px", color: "#333" },
    select: { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "12px" },
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
    row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" },
    progressBar: { height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden", marginTop: "8px" },
    progressFill: { height: "100%", backgroundColor: "#10b981", borderRadius: "4px", transition: "width 0.3s" },
    statValue: { fontSize: "28px", fontWeight: "bold", color: "#800020" },
    statLabel: { fontSize: "12px", color: "#666", marginTop: "4px" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "16px", padding: "24px", width: "90%", maxWidth: "600px", maxHeight: "85vh", overflow: "auto" },
    statusBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "500", display: "inline-block" }
  };

  const tabs = [
    { id: "dashboard", name: "Dashboard" },
    { id: "projects", name: "Projects" },
    { id: "milestones", name: "Milestones" },
    { id: "payments", name: "Payments" },
    { id: "inventory", name: "Inventory" },
    { id: "progress", name: "Progress" },
    { id: "extrawork", name: "Extra Works" },
    { id: "labour", name: "Labour" },
    { id: "reports", name: "Reports" }
  ];

  const renderDashboard = () => {
    const today = new Date();
    const endDate = new Date(selectedProjectData?.endDate || "");
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isUrgent = daysLeft < 30 && daysLeft > 0;
    const isOverdue = daysLeft < 0;
    
    return selectedProjectData ? React.createElement("div", null,
      React.createElement("div", { style: styles.grid4 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, progressPercent.toFixed(0), "%"),
          React.createElement("div", { style: styles.statLabel }, "Progress"),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${progressPercent}%`, backgroundColor: "#ffd700" } }))
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, completedMilestones, "/", projectMilestones.length),
          React.createElement("div", { style: styles.statLabel }, "Milestones Done")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, "₹", (totalPaid/100000).toFixed(2), "L"),
          React.createElement("div", { style: styles.statLabel }, "Total Paid")
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" } },
          React.createElement("div", { style: { ...styles.statValue, color: "white" } }, "₹", (balanceAmount/100000).toFixed(2), "L"),
          React.createElement("div", { style: styles.statLabel }, "Balance Amount")
        )
      ),
      React.createElement("div", { style: { ...styles.card, backgroundColor: isOverdue ? "#dc3545" : (isUrgent ? "#ffc107" : "#10b981"), color: "white", textAlign: "center" } },
        React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold" } },
          isOverdue ? "⚠️ PROJECT OVERDUE" : (isUrgent ? `🔔 ${Math.abs(daysLeft)} DAYS LEFT - URGENT` : `📅 ${daysLeft} DAYS LEFT FOR COMPLETION`)
        ),
        React.createElement("div", { style: { fontSize: "14px", marginTop: "8px" } }, "Target Completion: ", selectedProjectData.endDate)
      ),
      React.createElement("div", { style: styles.grid2 },
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" } },
          React.createElement("div", { style: styles.cardTitle }, "🏢 Project Details"),
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#800020" } }, selectedProjectData.name),
              React.createElement("div", null, React.createElement("strong", null, "Plot:"), " ", selectedProjectData.plotLength, "' x ", selectedProjectData.plotWidth, "'"),
              React.createElement("div", null, React.createElement("strong", null, "Floors:"), " ", selectedProjectData.floors),
              React.createElement("div", null, React.createElement("strong", null, "BUA:"), " ", selectedProjectData.bua?.toLocaleString(), " sq.ft")
            ),
            React.createElement("div", null,
              React.createElement("div", null, React.createElement("strong", null, "Contractor:"), " ", selectedProjectData.contractorName),
              React.createElement("div", null, React.createElement("strong", null, "Mobile:"), " ", selectedProjectData.contractorMobile),
              React.createElement("div", null, React.createElement("strong", null, "Rate:"), " ₹", selectedProjectData.ratePerSft, "/sq.ft"),
              React.createElement("div", null, React.createElement("strong", null, "Total:"), " ₹", (selectedProjectData.totalAmount/100000).toFixed(2), "L")
            )
          ),
          selectedProjectData.agreementUrl && React.createElement("div", { style: { marginTop: "12px", padding: "10px", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "8px" } },
            React.createElement("strong", null, "📄 Agreement Copy:"),
            React.createElement("a", { href: selectedProjectData.agreementUrl, target: "_blank", style: { color: "#800020", marginLeft: "10px", textDecoration: "underline" } }, "View Agreement"),
            React.createElement("button", { onClick: () => window.open(selectedProjectData.agreementUrl, "_blank"), style: { ...styles.buttonInfo, marginLeft: "10px", padding: "4px 12px", fontSize: "12px" } }, "Download")
          ),
          React.createElement("div", { style: { marginTop: "12px", padding: "10px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "8px" } },
            React.createElement("strong", null, "📅 Timeline:"), " ", selectedProjectData.startDate, " to ", selectedProjectData.endDate
          )
        ),
        React.createElement("div", { style: { ...styles.card, background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" } },
          React.createElement("div", { style: styles.cardTitle }, "💰 Financial Summary"),
          React.createElement("div", { style: styles.row2 },
            React.createElement("div", null, React.createElement("strong", null, "Contract Amount:"), React.createElement("br", null), "₹", (totalContractAmount/100000).toFixed(2), "L"),
            React.createElement("div", null, React.createElement("strong", null, "Extra Works:"), React.createElement("br", null), "₹", (totalExtraWorkAmount/100000).toFixed(2), "L"),
            React.createElement("div", null, React.createElement("strong", null, "Grand Total:"), React.createElement("br", null), "₹", (grandTotalAmount/100000).toFixed(2), "L"),
            React.createElement("div", null, React.createElement("strong", null, "Balance:"), React.createElement("br", null), "₹", (balanceAmount/100000).toFixed(2), "L")
          )
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📋 Recent Milestones"),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { style: styles.table },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", { style: styles.th }, "Milestone"),
                React.createElement("th", { style: styles.th }, "Phase"),
                React.createElement("th", { style: styles.th }, "Amount"),
                React.createElement("th", { style: styles.th }, "Contractor Status"),
                React.createElement("th", { style: styles.th }, "Owner Approved"),
                React.createElement("th", { style: styles.th }, "Payment")
              )
            ),
            React.createElement("tbody", null,
              projectMilestones.slice(0, 8).map((m: any) =>
                React.createElement("tr", { key: m.id },
                  React.createElement("td", { style: styles.td }, m.name),
                  React.createElement("td", { style: styles.td }, m.phase),
                  React.createElement("td", { style: styles.td }, "₹", (m.amount/1000).toFixed(0), "K"),
                  React.createElement("td", { style: styles.td }, React.createElement("span", { style: { ...styles.statusBadge, backgroundColor: m.contractorStatus === "Completed" ? "#d1fae5" : "#fed7aa", color: m.contractorStatus === "Completed" ? "#065f46" : "#92400e" } }, m.contractorStatus)),
                  React.createElement("td", { style: styles.td }, m.ownerApproved ? "✅ Approved" : "⏳ Pending"),
                  React.createElement("td", { style: styles.td }, m.paymentReleased ? (m.actualPaymentAmount ? `₹${(m.actualPaymentAmount/1000).toFixed(0)}K Paid` : "✅ Paid") : "⏳ Pending")
                )
              )
            )
          )
        )
      )
    ) : React.createElement("div", { style: styles.card }, 
      React.createElement("p", null, "Please select or create a project to get started."),
      React.createElement("button", { onClick: () => setShowAddProject(true), style: styles.button }, "+ Create New Project")
    );
  };

  const renderProjects = () => React.createElement("div", null,
    React.createElement("button", { onClick: () => setShowAddProject(true), style: styles.button }, "+ Create New Project"),
    React.createElement("div", { style: { marginTop: "20px" } },
      projects.map((p: any) =>
        React.createElement("div", { key: p.id, style: { ...styles.card, cursor: "pointer" }, onClick: () => { setSelectedProject(p.id); setActiveTab("dashboard"); } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" } },
            React.createElement("div", null,
              React.createElement("h3", { style: { margin: 0 } }, p.name),
              React.createElement("p", { style: { margin: "8px 0 0", fontSize: "13px", color: "#666" } }, p.contractorName, " | ", p.bua, " sq.ft")
            ),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: "24px", fontWeight: "bold", color: "#800020" } }, p.progress, "%"),
              React.createElement("div", null, p.status)
            )
          ),
          React.createElement("div", { style: styles.progressBar }, React.createElement("div", { style: { ...styles.progressFill, width: `${p.progress}%` } }))
        )
      )
    )
  );

  const renderMilestones = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "🎯 Project Milestones"),
    React.createElement("div", { style: { overflowX: "auto" } },
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "#"), React.createElement("th", { style: styles.th }, "Milestone"), React.createElement("th", { style: styles.th }, "Phase"),
            React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Due Date"),
            React.createElement("th", { style: styles.th }, "Contractor Status"), React.createElement("th", { style: styles.th }, "Owner Approval"),
            React.createElement("th", { style: styles.th }, "Invoice"), React.createElement("th", { style: styles.th }, "Payment"), React.createElement("th", { style: styles.th }, "Action")
          )
        ),
        React.createElement("tbody", null,
          projectMilestones.map((m: any) =>
            React.createElement("tr", { key: m.id },
              React.createElement("td", { style: styles.td }, m.id),
              React.createElement("td", { style: styles.td }, m.name),
              React.createElement("td", { style: styles.td }, m.phase),
              React.createElement("td", { style: styles.td }, "₹", (m.amount/1000).toFixed(0), "K"),
              React.createElement("td", { style: styles.td }, m.plannedEndDate),
              React.createElement("td", { style: styles.td },
                React.createElement("select", { value: m.contractorStatus, onChange: (e) => updateMilestoneStatus(m.id, e.target.value), style: { padding: "4px", borderRadius: "4px" } },
                  React.createElement("option", null, "Pending"),
                  React.createElement("option", null, "In Progress"),
                  React.createElement("option", null, "Completed")
                )
              ),
              React.createElement("td", { style: styles.td },
                !m.ownerApproved && m.contractorStatus === "Completed" && React.createElement("button", { onClick: () => approveMilestone(m), style: styles.buttonSuccess }, "Approve"),
                m.ownerApproved && React.createElement("span", { style: { color: "green" } }, "✅ Approved")
              ),
              React.createElement("td", { style: styles.td },
                m.ownerApproved && !m.invoiceRaised && React.createElement("button", { onClick: () => raiseInvoice(m), style: styles.buttonWarning }, "Raise Invoice"),
                m.invoiceRaised && React.createElement("span", { style: { color: "orange" } }, "📄 Raised")
              ),
              React.createElement("td", { style: styles.td },
                m.invoiceRaised && !m.paymentReleased && React.createElement("button", { onClick: () => { setSelectedMilestone(m); setShowPaymentModal(true); }, style: styles.buttonInfo }, "Release Payment"),
                m.paymentReleased && React.createElement("span", { style: { color: "green" } }, "✅ Paid")
              ),
              React.createElement("td", { style: styles.td }, m.paymentReleased && React.createElement("span", null, "UTR: ", m.utrNo || m.chequeNo))
            )
          )
        )
      )
    )
  );

  const renderPayments = () => {
    let cumulative = 0;
    return React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "💰 Payment Register"),
      React.createElement("div", { style: styles.grid3 },
        React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Total Contract"), React.createElement("br", null), "₹", (totalContractAmount/100000).toFixed(2), "L"),
        React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Total Paid"), React.createElement("br", null), "₹", (totalPaid/100000).toFixed(2), "L"),
        React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Balance"), React.createElement("br", null), "₹", (balanceAmount/100000).toFixed(2), "L")
      ),
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Milestone"),
            React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Cumulative Paid"),
            React.createElement("th", { style: styles.th }, "Balance"), React.createElement("th", { style: styles.th }, "Cheque/UTR")
          )
        ),
        React.createElement("tbody", null,
          projectPayments.map((p: any) => {
            cumulative += p.amount;
            const remaining = grandTotalAmount - cumulative;
            return React.createElement("tr", { key: p.id },
              React.createElement("td", { style: styles.td }, p.date),
              React.createElement("td", { style: styles.td }, p.milestoneName),
              React.createElement("td", { style: styles.td }, "₹", (p.amount/1000).toFixed(0), "K"),
              React.createElement("td", { style: styles.td }, "₹", (cumulative/100000).toFixed(2), "L"),
              React.createElement("td", { style: styles.td }, "₹", (remaining/100000).toFixed(2), "L"),
              React.createElement("td", { style: styles.td }, p.chequeNo || p.utrNo)
            );
          }),
          projectPayments.length === 0 && React.createElement("tr", null, React.createElement("td", { colSpan: 6, style: { textAlign: "center", padding: "40px" } }, "No payments recorded yet"))
        )
      )
    );
  };

  const renderInventory = () => React.createElement("div", null,
    React.createElement("button", { onClick: () => setShowMaterialModal(true), style: styles.button }, "+ Receive Material"),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "📦 Material Inventory"),
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Code"), React.createElement("th", { style: styles.th }, "Material"),
            React.createElement("th", { style: styles.th }, "Received"), React.createElement("th", { style: styles.th }, "Consumed"),
            React.createElement("th", { style: styles.th }, "Balance"), React.createElement("th", { style: styles.th }, "Supplier"), React.createElement("th", { style: styles.th }, "Invoice")
          )
        ),
        React.createElement("tbody", null,
          projectInventory.map((i: any) =>
            React.createElement("tr", { key: i.id },
              React.createElement("td", { style: styles.td }, i.materialCode),
              React.createElement("td", { style: styles.td }, i.material),
              React.createElement("td", { style: styles.td }, i.receivedQty, " ", i.unit),
              React.createElement("td", { style: styles.td }, React.createElement("input", { type: "number", value: i.consumed, onChange: (e) => updateConsumed(i.id, e.target.value), style: { width: "70px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" } })),
              React.createElement("td", { style: styles.td }, i.balance, " ", i.unit),
              React.createElement("td", { style: styles.td }, i.supplier),
              React.createElement("td", { style: styles.td }, i.invoiceNo)
            )
          )
        )
      )
    )
  );

  const renderProgress = () => React.createElement("div", null,
    React.createElement("button", { onClick: () => setShowMediaModal(true), style: styles.button }, "+ Upload Photo/Video"),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "📸 Site Progress Gallery"),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" } },
        projectMedia.map((m: any) =>
          React.createElement("div", { key: m.id, style: { border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", cursor: "pointer" }, onClick: () => setSelectedMedia(m) },
            React.createElement("img", { src: m.url, style: { width: "100%", height: "140px", objectFit: "cover" } }),
            React.createElement("div", { style: { padding: "10px", fontSize: "12px", fontWeight: "500" } }, m.title),
            React.createElement("div", { style: { padding: "0 10px 10px", fontSize: "10px", color: "#666" } }, m.date)
          )
        )
      )
    )
  );

  const renderExtraWorks = () => React.createElement("div", null,
    React.createElement("button", { onClick: () => setShowExtraWorkModal(true), style: styles.button }, "+ Add Extra Work"),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: styles.cardTitle }, "🔧 Extra Works / Alterations"),
      React.createElement("table", { style: styles.table },
        React.createElement("thead", null,
          React.createElement("tr", null,
            React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Description"),
            React.createElement("th", { style: styles.th }, "Qty"), React.createElement("th", { style: styles.th }, "Unit"),
            React.createElement("th", { style: styles.th }, "Rate"), React.createElement("th", { style: styles.th }, "Amount"),
            React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
          )
        ),
        React.createElement("tbody", null,
          projectExtraWorks.map((w: any) =>
            React.createElement("tr", { key: w.id },
              React.createElement("td", { style: styles.td }, w.date),
              React.createElement("td", { style: styles.td }, w.description),
              React.createElement("td", { style: styles.td }, w.quantity),
              React.createElement("td", { style: styles.td }, w.unit || "Nos"),
              React.createElement("td", { style: styles.td }, "₹", w.rate),
              React.createElement("td", { style: styles.td }, "₹", w.amount.toLocaleString()),
              React.createElement("td", { style: styles.td }, w.status),
              React.createElement("td", { style: styles.td },
                w.status === "Pending Owner Approval" && React.createElement("button", { onClick: () => approveExtraWork(w.id), style: styles.buttonSuccess }, "Approve")
              )
            )
          )
        )
      )
    )
  );

  const renderLabour = () => {
    const totalLabourPayment = projectLabour.reduce((sum: number, l: any) => sum + (l.totalPayment || 0), 0);
    return React.createElement("div", null,
      React.createElement("button", { onClick: () => setShowLabourModal(true), style: styles.button }, "+ Add Labour"),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "👷 Labour Management"),
        React.createElement("div", { style: styles.grid3 },
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Total Labours"), React.createElement("br", null), projectLabour.length),
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Total Payment Due"), React.createElement("br", null), "₹", (totalLabourPayment/1000).toFixed(2), "K"),
          React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center" } }, React.createElement("strong", null, "Active Labours"), React.createElement("br", null), projectLabour.filter((l: any) => l.status === "Present").length)
        ),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Name"), React.createElement("th", { style: styles.th }, "Role"),
              React.createElement("th", { style: styles.th }, "Daily Wage"), React.createElement("th", { style: styles.th }, "Days Present"),
              React.createElement("th", { style: styles.th }, "Total Payment"), React.createElement("th", { style: styles.th }, "Status"), React.createElement("th", { style: styles.th }, "Action")
            )
          ),
          React.createElement("tbody", null,
            projectLabour.map((l: any) =>
              React.createElement("tr", { key: l.id },
                React.createElement("td", { style: styles.td }, l.name),
                React.createElement("td", { style: styles.td }, l.role),
                React.createElement("td", { style: styles.td }, "₹", l.dailyWage),
                React.createElement("td", { style: styles.td }, React.createElement("input", { type: "number", value: l.daysPresent, onChange: (e) => updateLabourAttendance(l.id, e.target.value), style: { width: "70px", padding: "4px", borderRadius: "4px", border: "1px solid #ddd" } })),
                React.createElement("td", { style: styles.td }, "₹", l.totalPayment?.toLocaleString()),
                React.createElement("td", { style: styles.td }, l.status),
                React.createElement("td", { style: styles.td },
                  React.createElement("button", { onClick: () => { setSelectedLabour(l); setShowLabourPaymentModal(true); }, style: styles.buttonInfo }, "Make Payment")
                )
              )
            )
          )
        )
      ),
      React.createElement("div", { style: styles.card },
        React.createElement("div", { style: styles.cardTitle }, "📜 Labour Payment History"),
        React.createElement("table", { style: styles.table },
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", { style: styles.th }, "Date"), React.createElement("th", { style: styles.th }, "Labour Name"),
              React.createElement("th", { style: styles.th }, "Amount"), React.createElement("th", { style: styles.th }, "Month"), React.createElement("th", { style: styles.th }, "Reference")
            )
          ),
          React.createElement("tbody", null,
            labourPaymentHistory.map((p: any) =>
              React.createElement("tr", { key: p.id },
                React.createElement("td", { style: styles.td }, p.date),
                React.createElement("td", { style: styles.td }, p.labourName),
                React.createElement("td", { style: styles.td }, "₹", p.amount.toLocaleString()),
                React.createElement("td", { style: styles.td }, p.month),
                React.createElement("td", { style: styles.td }, p.chequeNo || p.utrNo)
              )
            )
          )
        )
      )
    );
  };

  const renderReports = () => React.createElement("div", { style: styles.card },
    React.createElement("div", { style: styles.cardTitle }, "📊 Reports & Analytics"),
    React.createElement("div", { style: styles.row2 },
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Report Type"),
        React.createElement("select", { value: reportType, onChange: (e) => setReportType(e.target.value), style: styles.select },
          React.createElement("option", { value: "milestones" }, "Milestones Report"),
          React.createElement("option", { value: "payments" }, "Payments Report"),
          React.createElement("option", { value: "inventory" }, "Inventory Report"),
          React.createElement("option", { value: "extrawork" }, "Extra Works Report"),
          React.createElement("option", { value: "labour" }, "Labour Report")
        )
      ),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Start Date"),
        React.createElement("input", { type: "date", value: reportFilters.startDate, onChange: (e) => setReportFilters({...reportFilters, startDate: e.target.value}), style: styles.input })
      ),
      React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "End Date"),
        React.createElement("input", { type: "date", value: reportFilters.endDate, onChange: (e) => setReportFilters({...reportFilters, endDate: e.target.value}), style: styles.input })
      )
    ),
    React.createElement("div", { style: styles.row3 },
      (reportType === "inventory") && React.createElement(React.Fragment, null,
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Material Wise"),
          React.createElement("input", { type: "text", placeholder: "Filter by material", value: reportFilters.material, onChange: (e) => setReportFilters({...reportFilters, material: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Supplier Wise"),
          React.createElement("input", { type: "text", placeholder: "Filter by supplier", value: reportFilters.supplier, onChange: (e) => setReportFilters({...reportFilters, supplier: e.target.value}), style: styles.input })
        )
      ),
      (reportType === "labour") && React.createElement(React.Fragment, null,
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Labour Name"),
          React.createElement("input", { type: "text", placeholder: "Filter by labour", value: reportFilters.labourName, onChange: (e) => setReportFilters({...reportFilters, labourName: e.target.value}), style: styles.input })
        ),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Role"),
          React.createElement("input", { type: "text", placeholder: "Filter by role", value: reportFilters.role, onChange: (e) => setReportFilters({...reportFilters, role: e.target.value}), style: styles.input })
        )
      ),
      (reportType === "payments") && React.createElement("div", null,
        React.createElement("label", { style: styles.label }, "Contractor Wise"),
        React.createElement("input", { type: "text", placeholder: "Filter by contractor", value: reportFilters.contractor, onChange: (e) => setReportFilters({...reportFilters, contractor: e.target.value}), style: styles.input })
      )
    ),
    React.createElement("button", { onClick: () => setShowReportModal(true), style: { ...styles.button, marginTop: "16px" } }, "Generate Report")
  );

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard": return renderDashboard();
      case "projects": return renderProjects();
      case "milestones": return renderMilestones();
      case "payments": return renderPayments();
      case "inventory": return renderInventory();
      case "progress": return renderProgress();
      case "extrawork": return renderExtraWorks();
      case "labour": return renderLabour();
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return React.createElement("div", { style: styles.container },
    React.createElement("div", { style: styles.header },
      React.createElement("div", null,
        React.createElement("h1", { style: styles.headerTitle }, "Buyer Dashboard"),
        React.createElement("p", { style: styles.headerSub }, "Track your construction project")
      ),
      React.createElement("div", null,
        React.createElement("button", { onClick: shareWhatsApp, style: styles.buttonSuccess }, "📱 Share Update"),
        React.createElement("button", { onClick: () => window.location.href = "/", style: { ...styles.button, backgroundColor: "#dc3545", marginLeft: "8px" } }, "🚪 Logout")
      )
    ),
    React.createElement("div", { style: styles.card },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("label", { style: styles.label }, "Select Project"),
          React.createElement("select", { value: selectedProject || "", onChange: (e) => setSelectedProject(parseInt(e.target.value)), style: styles.select },
            React.createElement("option", { value: "" }, "-- Select Project --"),
            projects.map((p: any) => React.createElement("option", { key: p.id, value: p.id }, p.name, " - ", p.status, " (", p.progress, "%)"))
          )
        ),
        React.createElement("button", { onClick: () => setShowAddProject(true), style: { ...styles.button, marginTop: "24px" } }, "+ New Project")
      )
    ),
    React.createElement("div", { style: styles.tabContainer },
      tabs.map(tab => React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { ...styles.tab, ...(activeTab === tab.id ? styles.activeTab : {}) } }, tab.name))
    ),
    renderContent(),
    
    // Modals
    showAddProject && React.createElement("div", { style: styles.modal, onClick: () => setShowAddProject(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h2", { style: { color: "#800020" } }, "Create New Project"),
        React.createElement("label", { style: styles.label }, "Project Name *"),
        React.createElement("input", { type: "text", value: newProject.name, onChange: (e) => setNewProject({...newProject, name: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row3 },
          React.createElement("div", null,
            React.createElement("label", null, "Length (ft) *"),
            React.createElement("input", { type: "number", value: newProject.plotLength, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, plotLength: val}); const bua = calculateBUA(val, newProject.plotWidth, newProject.floors); setNewProject(prev => ({...prev, bua, totalAmount: bua * prev.ratePerSft})); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "Width (ft) *"),
            React.createElement("input", { type: "number", value: newProject.plotWidth, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, plotWidth: val}); const bua = calculateBUA(newProject.plotLength, val, newProject.floors); setNewProject(prev => ({...prev, bua, totalAmount: bua * prev.ratePerSft})); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "No. of Floors"),
            React.createElement("input", { type: "number", value: newProject.floors, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, floors: val}); const bua = calculateBUA(newProject.plotLength, newProject.plotWidth, val); setNewProject(prev => ({...prev, bua, totalAmount: bua * prev.ratePerSft})); }, style: styles.input })
          )
        ),
        React.createElement("div", { style: { backgroundColor: "#e8f5e9", padding: "12px", borderRadius: "8px", marginBottom: "16px" } },
          React.createElement("div", null, "📐 Calculated BUA: ", newProject.bua, " sq.ft"),
          React.createElement("div", null, "💰 Total Contract Value: ₹", (newProject.totalAmount/100000).toFixed(2), "L")
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", null, "Rate per sq.ft (₹)"),
            React.createElement("input", { type: "number", value: newProject.ratePerSft, onChange: (e) => { const val = parseFloat(e.target.value); setNewProject({...newProject, ratePerSft: val, totalAmount: newProject.bua * val}); }, style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "Contractor Name"),
            React.createElement("input", { type: "text", value: newProject.contractorName, onChange: (e) => setNewProject({...newProject, contractorName: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", null, "Contractor Mobile"),
            React.createElement("input", { type: "tel", value: newProject.contractorMobile, onChange: (e) => setNewProject({...newProject, contractorMobile: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "Contractor Address"),
            React.createElement("input", { type: "text", value: newProject.contractorAddress, onChange: (e) => setNewProject({...newProject, contractorAddress: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("div", null,
            React.createElement("label", null, "Start Date *"),
            React.createElement("input", { type: "date", value: newProject.startDate, onChange: (e) => setNewProject({...newProject, startDate: e.target.value}), style: styles.input })
          ),
          React.createElement("div", null,
            React.createElement("label", null, "End Date *"),
            React.createElement("input", { type: "date", value: newProject.endDate, onChange: (e) => setNewProject({...newProject, endDate: e.target.value}), style: styles.input })
          )
        ),
        React.createElement("div", null,
          React.createElement("label", null, "Agreement Upload"),
          React.createElement("input", { type: "file", onChange: (e) => setAgreementFile(e.target.files?.[0] || null), style: styles.input })
        ),
        React.createElement("button", { onClick: addProject, style: { ...styles.buttonSuccess, width: "100%", marginTop: "16px" } }, "Create Project")
      )
    ),
    
    showPaymentModal && selectedMilestone && React.createElement("div", { style: styles.modal, onClick: () => setShowPaymentModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Release Payment for ", selectedMilestone.name),
        React.createElement("p", null, React.createElement("strong", null, "Milestone Amount:"), " ₹", (selectedMilestone.amount/1000).toFixed(0), "K"),
        React.createElement("div", null,
          React.createElement("label", { style: styles.label }, "Payment Amount (₹)"),
          React.createElement("input", { type: "number", placeholder: "Enter payment amount", value: actualPaymentAmount, onChange: (e) => setActualPaymentAmount(e.target.value), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Cheque Number", value: chequeNo, onChange: (e) => setChequeNo(e.target.value), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "UTR Number", value: utrNo, onChange: (e) => setUtrNo(e.target.value), style: styles.input })
        ),
        React.createElement("button", { onClick: releasePayment, style: styles.buttonSuccess }, "Release Payment")
      )
    ),
    
    showMaterialModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMaterialModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Receive Material"),
        React.createElement("input", { type: "text", placeholder: "Material Name", value: newMaterial.material, onChange: (e) => setNewMaterial({...newMaterial, material: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Quantity", value: newMaterial.receivedQty, onChange: (e) => setNewMaterial({...newMaterial, receivedQty: e.target.value}), style: styles.input }),
          React.createElement("select", { value: newMaterial.unit, onChange: (e) => setNewMaterial({...newMaterial, unit: e.target.value}), style: styles.select },
            React.createElement("option", null, "bags"), React.createElement("option", null, "kg"), React.createElement("option", null, "cft")
          )
        ),
        React.createElement("input", { type: "text", placeholder: "Supplier", value: newMaterial.supplier, onChange: (e) => setNewMaterial({...newMaterial, supplier: e.target.value}), style: styles.input }),
        React.createElement("input", { type: "text", placeholder: "Invoice No", value: newMaterial.invoiceNo, onChange: (e) => setNewMaterial({...newMaterial, invoiceNo: e.target.value}), style: styles.input }),
        React.createElement("button", { onClick: addMaterial, style: styles.buttonSuccess }, "Record Material")
      )
    ),
    
    showMediaModal && React.createElement("div", { style: styles.modal, onClick: () => setShowMediaModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Upload Media"),
        React.createElement("select", { value: mediaType, onChange: (e) => setMediaType(e.target.value), style: styles.select },
          React.createElement("option", null, "photo"), React.createElement("option", null, "video")
        ),
        React.createElement("input", { type: "text", placeholder: "Title", value: mediaTitle, onChange: (e) => setMediaTitle(e.target.value), style: styles.input }),
        React.createElement("input", { type: "file", accept: mediaType === "photo" ? "image/*" : "video/*", onChange: (e) => setMediaFile(e.target.files?.[0] || null), style: styles.input }),
        React.createElement("button", { onClick: uploadMedia, style: styles.buttonSuccess }, "Upload")
      )
    ),
    
    showExtraWorkModal && React.createElement("div", { style: styles.modal, onClick: () => setShowExtraWorkModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Extra Work / Alteration"),
        React.createElement("input", { type: "text", placeholder: "Description", value: extraWork.description, onChange: (e) => setExtraWork({...extraWork, description: e.target.value}), style: styles.input }),
        React.createElement("div", { style: styles.row3 },
          React.createElement("input", { type: "number", placeholder: "Quantity", value: extraWork.quantity, onChange: (e) => setExtraWork({...extraWork, quantity: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "Unit (sqft/m/kg/Nos)", value: extraWork.unit, onChange: (e) => setExtraWork({...extraWork, unit: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Rate (₹)", value: extraWork.rate, onChange: (e) => setExtraWork({...extraWork, rate: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addExtraWork, style: styles.buttonSuccess }, "Submit Extra Work")
      )
    ),
    
    showLabourModal && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Add Labour"),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Labour Name", value: newLabour.name, onChange: (e) => setNewLabour({...newLabour, name: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "Role (Mason/Carpenter/Labour)", value: newLabour.role, onChange: (e) => setNewLabour({...newLabour, role: e.target.value}), style: styles.input })
        ),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "number", placeholder: "Daily Wage (₹)", value: newLabour.dailyWage, onChange: (e) => setNewLabour({...newLabour, dailyWage: e.target.value}), style: styles.input }),
          React.createElement("input", { type: "number", placeholder: "Days Present", value: newLabour.daysPresent, onChange: (e) => setNewLabour({...newLabour, daysPresent: e.target.value}), style: styles.input })
        ),
        React.createElement("button", { onClick: addLabour, style: styles.buttonSuccess }, "Add Labour")
      )
    ),
    
    showLabourPaymentModal && selectedLabour && React.createElement("div", { style: styles.modal, onClick: () => setShowLabourPaymentModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Release Labour Payment"),
        React.createElement("p", null, React.createElement("strong", null, "Labour:"), " ", selectedLabour.name),
        React.createElement("p", null, React.createElement("strong", null, "Total Due:"), " ₹", selectedLabour.totalPayment?.toLocaleString()),
        React.createElement("div", { style: styles.row2 },
          React.createElement("input", { type: "text", placeholder: "Cheque Number", value: chequeNo, onChange: (e) => setChequeNo(e.target.value), style: styles.input }),
          React.createElement("input", { type: "text", placeholder: "UTR Number", value: utrNo, onChange: (e) => setUtrNo(e.target.value), style: styles.input })
        ),
        React.createElement("button", { onClick: makeLabourPayment, style: styles.buttonSuccess }, "Release Payment")
      )
    ),
    
    showReportModal && React.createElement("div", { style: styles.modal, onClick: () => setShowReportModal(false) },
      React.createElement("div", { style: styles.modalContent, onClick: (e) => e.stopPropagation() },
        React.createElement("h3", null, "Generate Report"),
        React.createElement("button", { onClick: generateReport, style: styles.buttonSuccess }, "Download Excel Report")
      )
    ),
    
    showMediaViewer && selectedMedia && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }, onClick: () => setShowMediaViewer(false) },
      React.createElement("div", null,
        React.createElement("img", { src: selectedMedia.url, style: { maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px" } }),
        React.createElement("button", { onClick: () => setShowMediaViewer(false), style: { position: "absolute", top: 20, right: 30, color: "white", fontSize: 30, background: "none", border: "none", cursor: "pointer" } }, "×")
      )
    )
  );
}