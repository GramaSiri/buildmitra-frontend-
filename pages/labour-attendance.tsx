import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';

interface ProjectSite {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  city: string;
  contractorName: string;
}

interface WorkerMasterItem {
  id: string;
  workerCode: string;
  name: string;
  mobile: string;
  category: string; // Mason, Carpenter, Electrician, Helper, Welder, Plumber
  siteId: string;
  siteName: string;
  jobAllocated: string;
  workingTimings: string;
  supplierName: string;
  basicWage: number;
  pfAmount: number;
  esiAmount: number;
  insuranceAmount: number;
  conveyanceAmount: number;
  extraAllowances: number;
  totalCtcSalary: number;
  appInviteLink: string;
}

interface AttendanceLog {
  id: string;
  workerCode: string;
  workerName: string;
  skill: string;
  supplierName: string;
  siteId: string;
  siteName: string;
  punchInTime: string;
  punchOutTime: string;
  dateStr: string;
  otHours: number;
  attendanceStatus: 'Present' | 'Absent' | 'Early Out' | 'Late Come' | 'Half Day';
  wageAmount: number;
  remarks: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  isGeofenceValid: boolean;
}

interface WorkerDeduction {
  advanceAmount: number;
  damageFine: number;
  lostMaterialPenalty: number;
  otherDeductions: number;
  notes: string;
}

const DEFAULT_PROJECT_SITES: ProjectSite[] = [
  { id: 'site-1', name: 'Site A: Peenya Industrial Shed', code: 'PRJ-PEENYA-01', lat: 13.0312, lng: 77.5184, radiusMeters: 50, city: 'Bengaluru', contractorName: 'BuildMitra Infra' },
  { id: 'site-2', name: 'Site B: Whitefield Logistics Warehouse', code: 'PRJ-WHTFLD-02', lat: 12.9698, lng: 77.7499, radiusMeters: 50, city: 'Bengaluru', contractorName: 'BuildMitra Infra' },
  { id: 'site-3', name: 'Site C: Electronic City Commercial Hub', code: 'PRJ-ECITY-03', lat: 12.8452, lng: 77.6602, radiusMeters: 60, city: 'Bengaluru', contractorName: 'BuildMitra Infra' }
];

const DEFAULT_MASTER_WORKERS: WorkerMasterItem[] = [
  {
    id: 'w-1',
    workerCode: 'LAB-001',
    name: 'Ramesh Kumar',
    mobile: '9876511111',
    category: 'Mason',
    siteId: 'site-1',
    siteName: 'Site A: Peenya Industrial Shed',
    jobAllocated: 'Steel Structure Anchor Bolt & Masonry Base',
    workingTimings: '08:30 AM - 05:30 PM',
    supplierName: 'Karnataka Labour Logistics',
    basicWage: 18000,
    pfAmount: 1800,
    esiAmount: 600,
    insuranceAmount: 300,
    conveyanceAmount: 1500,
    extraAllowances: 800,
    totalCtcSalary: 23000,
    appInviteLink: 'https://buildmitra.com/labour-attendance?workerCode=LAB-001&mode=restricted'
  },
  {
    id: 'w-2',
    workerCode: 'LAB-002',
    name: 'Suresh Patel',
    mobile: '9876522222',
    category: 'Carpenter',
    siteId: 'site-1',
    siteName: 'Site A: Peenya Industrial Shed',
    jobAllocated: 'Formwork & Shuttering Support',
    workingTimings: '08:30 AM - 05:30 PM',
    supplierName: 'Karnataka Labour Logistics',
    basicWage: 16000,
    pfAmount: 1600,
    esiAmount: 500,
    insuranceAmount: 250,
    conveyanceAmount: 1200,
    extraAllowances: 650,
    totalCtcSalary: 20200,
    appInviteLink: 'https://buildmitra.com/labour-attendance?workerCode=LAB-002&mode=restricted'
  },
  {
    id: 'w-3',
    workerCode: 'LAB-003',
    name: 'Mahesh Singh',
    mobile: '9876533333',
    category: 'Helper',
    siteId: 'site-2',
    siteName: 'Site B: Whitefield Logistics Warehouse',
    jobAllocated: 'Material Unloading & Site Cleanup',
    workingTimings: '08:30 AM - 05:30 PM',
    supplierName: 'Apex Manpower Services',
    basicWage: 12000,
    pfAmount: 1200,
    esiAmount: 400,
    insuranceAmount: 200,
    conveyanceAmount: 1000,
    extraAllowances: 500,
    totalCtcSalary: 15300,
    appInviteLink: 'https://buildmitra.com/labour-attendance?workerCode=LAB-003&mode=restricted'
  }
];

// Generate 30-day initial logs for demo
function generate30DayLogs(): AttendanceLog[] {
  const logs: AttendanceLog[] = [];
  const today = new Date();

  DEFAULT_MASTER_WORKERS.forEach(worker => {
    for (let day = 1; day <= 30; day++) {
      const d = new Date(today.getFullYear(), today.getMonth(), day);
      const dateStr = d.toISOString().split('T')[0];

      // Simulate status
      let status: 'Present' | 'Absent' | 'Early Out' | 'Late Come' | 'Half Day' = 'Present';
      let inTime = '08:30 AM';
      let outTime = '05:30 PM';
      let ot = 0;

      if (day % 7 === 0) {
        status = 'Absent';
        inTime = '--:--';
        outTime = '--:--';
      } else if (day === 12) {
        status = 'Half Day';
        outTime = '01:15 PM';
      } else if (day === 18) {
        status = 'Early Out';
        outTime = '04:00 PM';
      } else if (day === 24) {
        status = 'Late Come';
        inTime = '09:45 AM';
      } else if (day % 5 === 0) {
        ot = 2;
      }

      const dailyRate = Math.round(worker.totalCtcSalary / 30);
      let earned = dailyRate;
      if (status === 'Absent') earned = 0;
      if (status === 'Half Day') earned = Math.round(dailyRate / 2);
      earned += ot * 120;

      logs.push({
        id: `att-${worker.workerCode}-${day}`,
        workerCode: worker.workerCode,
        workerName: worker.name,
        skill: worker.category,
        supplierName: worker.supplierName,
        siteId: worker.siteId,
        siteName: worker.siteName,
        punchInTime: inTime,
        punchOutTime: outTime,
        dateStr: dateStr,
        otHours: ot,
        attendanceStatus: status,
        wageAmount: earned,
        remarks: status === 'Present' ? (ot > 0 ? `Normal Shift + ${ot}h OT` : 'Normal Shift') : `${status} Logged`,
        lat: 13.0312,
        lng: 77.5184,
        distanceMeters: 18,
        isGeofenceValid: true
      });
    }
  });

  return logs;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function LabourAttendancePage() {
  const router = useRouter();
  const restrictedMode = router.query.mode === 'restricted';

  const [activeTab, setActiveTab] = useState<'onboarding' | 'punch' | 'grid30' | 'reports'>('grid30');
  const [sites] = useState<ProjectSite[]>(DEFAULT_PROJECT_SITES);
  const [workers, setWorkers] = useState<WorkerMasterItem[]>(() => {
    try {
      const saved = localStorage.getItem('bm_master_workers');
      return saved ? JSON.parse(saved) : DEFAULT_MASTER_WORKERS;
    } catch {
      return DEFAULT_MASTER_WORKERS;
    }
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    try {
      const saved = localStorage.getItem('bm_labour_attendance_logs');
      return saved ? JSON.parse(saved) : generate30DayLogs();
    } catch {
      return generate30DayLogs();
    }
  });

  const [deductions, setDeductions] = useState<Record<string, WorkerDeduction>>(() => {
    try {
      const saved = localStorage.getItem('bm_labour_deductions');
      return saved ? JSON.parse(saved) : {
        'LAB-001': { advanceAmount: 1500, damageFine: 200, lostMaterialPenalty: 0, otherDeductions: 0, notes: 'Mid-month Advance Rs 1500 + Safety vest fine' }
      };
    } catch {
      return {};
    }
  });

  // Selected Worker for 30-Day Grid
  const [selectedWorkerCode, setSelectedWorkerCode] = useState<string>(DEFAULT_MASTER_WORKERS[0].workerCode);

  // New Worker Onboarding Form State
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerMobile, setNewWorkerMobile] = useState('');
  const [newWorkerCategory, setNewWorkerCategory] = useState('Mason');
  const [newWorkerSiteId, setNewWorkerSiteId] = useState(DEFAULT_PROJECT_SITES[0].id);
  const [newWorkerJob, setNewWorkerJob] = useState('Structural Steel Erection & Concrete Base');
  const [newWorkerTimings, setNewWorkerTimings] = useState('08:30 AM - 05:30 PM');
  const [newWorkerBasic, setNewWorkerBasic] = useState<number>(18000);
  const [newWorkerPf, setNewWorkerPf] = useState<number>(1800);
  const [newWorkerEsi, setNewWorkerEsi] = useState<number>(600);
  const [newWorkerInsurance, setNewWorkerInsurance] = useState<number>(300);
  const [newWorkerConveyance, setNewWorkerConveyance] = useState<number>(1500);
  const [newWorkerExtra, setNewWorkerExtra] = useState<number>(800);

  // Punch Terminal States
  const [selectedPunchWorkerCode, setSelectedPunchWorkerCode] = useState<string>(DEFAULT_MASTER_WORKERS[0].workerCode);
  const [selectedPunchSiteId, setSelectedPunchSiteId] = useState<string>(DEFAULT_PROJECT_SITES[0].id);
  const [punchStatusOption, setPunchStatusOption] = useState<'Present' | 'Half Day' | 'Early Out' | 'Late Come'>('Present');
  const [customOtHours, setCustomOtHours] = useState<number>(0);
  const [punchRemarksInput, setPunchRemarksInput] = useState<string>('Normal Shift');

  // Simulation & GPS
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(true);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(18);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Ready for 50m GPS detection');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [punchFeedback, setPunchFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Filter for Reports
  const [reportFilterSite, setReportFilterSite] = useState<string>('all');
  const [reportFilterCategory, setReportFilterCategory] = useState<string>('all');

  useEffect(() => {
    try { localStorage.setItem('bm_master_workers', JSON.stringify(workers)); } catch (e) { console.error(e); }
  }, [workers]);

  useEffect(() => {
    try { localStorage.setItem('bm_labour_attendance_logs', JSON.stringify(attendanceLogs)); } catch (e) { console.error(e); }
  }, [attendanceLogs]);

  useEffect(() => {
    try { localStorage.setItem('bm_labour_deductions', JSON.stringify(deductions)); } catch (e) { console.error(e); }
  }, [deductions]);

  // Total CTC Calculation
  const calculatedTotalCtc = useMemo(() => {
    return (newWorkerBasic || 0) + (newWorkerPf || 0) + (newWorkerEsi || 0) + (newWorkerInsurance || 0) + (newWorkerConveyance || 0) + (newWorkerExtra || 0);
  }, [newWorkerBasic, newWorkerPf, newWorkerEsi, newWorkerInsurance, newWorkerConveyance, newWorkerExtra]);

  // Handle Add New Worker
  const handleCreateWorker = () => {
    if (!newWorkerName || !newWorkerMobile) return alert("Please enter worker name and mobile number");
    const code = `LAB-${Math.floor(100 + Math.random() * 900)}`;
    const siteObj = sites.find(s => s.id === newWorkerSiteId) || sites[0];
    const link = `https://buildmitra.com/labour-attendance?workerCode=${code}&mode=restricted`;

    const newWorker: WorkerMasterItem = {
      id: `w-${Date.now()}`,
      workerCode: code,
      name: newWorkerName,
      mobile: newWorkerMobile,
      category: newWorkerCategory,
      siteId: siteObj.id,
      siteName: siteObj.name,
      jobAllocated: newWorkerJob,
      workingTimings: newWorkerTimings,
      supplierName: 'BuildMitra Labour Logistics',
      basicWage: newWorkerBasic,
      pfAmount: newWorkerPf,
      esiAmount: newWorkerEsi,
      insuranceAmount: newWorkerInsurance,
      conveyanceAmount: newWorkerConveyance,
      extraAllowances: newWorkerExtra,
      totalCtcSalary: calculatedTotalCtc,
      appInviteLink: link
    };

    setWorkers(prev => [...prev, newWorker]);
    setSelectedWorkerCode(code);
    alert(`Worker ${newWorkerName} registered! BuildMitra Geofence Link generated.`);
    setActiveTab('grid30');
  };

  // WhatsApp Invite
  const handleSendWhatsAppInvite = (w: WorkerMasterItem) => {
    const text = encodeURIComponent(
      `Hello ${w.name},\n` +
      `Your BuildMitra Labour Attendance App Link for ${w.siteName} has been generated.\n\n` +
      `📍 Assigned Site: ${w.siteName}\n` +
      `⏱️ Shift Timings: ${w.workingTimings}\n` +
      `📲 Open link on your mobile to Punch IN/OUT:\n${w.appInviteLink}`
    );
    window.open(`https://wa.me/91${w.mobile.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // Active Selected Worker for 30-Day Grid
  const activeGridWorker = useMemo(() => {
    return workers.find(w => w.workerCode === selectedWorkerCode) || workers[0];
  }, [workers, selectedWorkerCode]);

  const activeWorkerLogs = useMemo(() => {
    if (!activeGridWorker) return [];
    return attendanceLogs.filter(l => l.workerCode === activeGridWorker.workerCode);
  }, [attendanceLogs, activeGridWorker]);

  // 30-Day Summary Metrics for Active Worker
  const activeWorkerMetrics = useMemo(() => {
    if (!activeGridWorker) return { daysPresent: 0, otHours: 0, grossEarned: 0, deductionsTotal: 0, netPayable: 0 };
    const daysPresent = activeWorkerLogs.filter(l => l.attendanceStatus === 'Present' || l.attendanceStatus === 'Late Come' || l.attendanceStatus === 'Early Out').length + (activeWorkerLogs.filter(l => l.attendanceStatus === 'Half Day').length * 0.5);
    const otHours = activeWorkerLogs.reduce((acc, l) => acc + l.otHours, 0);
    const grossEarned = activeWorkerLogs.reduce((acc, l) => acc + l.wageAmount, 0);

    const d = deductions[activeGridWorker.workerCode] || { advanceAmount: 0, damageFine: 0, lostMaterialPenalty: 0, otherDeductions: 0, notes: '' };
    const deductionsTotal = (d.advanceAmount || 0) + (d.damageFine || 0) + (d.lostMaterialPenalty || 0) + (d.otherDeductions || 0) + activeGridWorker.pfAmount + activeGridWorker.esiAmount;
    const netPayable = Math.max(0, grossEarned - deductionsTotal);

    return {
      daysPresent,
      otHours,
      grossEarned,
      deductionsTotal,
      netPayable
    };
  }, [activeGridWorker, activeWorkerLogs, deductions]);

  // Punch Terminal Log Action
  const selectedPunchSite = useMemo(() => sites.find(s => s.id === selectedPunchSiteId) || sites[0], [sites, selectedPunchSiteId]);
  const selectedPunchWorker = useMemo(() => workers.find(w => w.workerCode === selectedPunchWorkerCode) || workers[0], [workers, selectedPunchWorkerCode]);

  const calculatedDistance = useMemo(() => {
    if (useSimulationMode) return simulatedDistance;
    if (userLat !== null && userLng !== null && selectedPunchSite) {
      return calculateHaversineDistance(userLat, userLng, selectedPunchSite.lat, selectedPunchSite.lng);
    }
    return null;
  }, [useSimulationMode, simulatedDistance, userLat, userLng, selectedPunchSite]);

  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationStatus("Locking 50m GPS signal...");
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported. Using simulation mode.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setUseSimulationMode(false);
        setIsLocating(false);
        setLocationStatus(`GPS Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`GPS error: ${err.message}. Using Simulation mode.`);
        setUseSimulationMode(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePunch = (type: 'IN' | 'OUT') => {
    const distance = calculatedDistance !== null ? calculatedDistance : 18;
    if (distance > selectedPunchSite.radiusMeters) {
      setPunchFeedback({
        success: false,
        message: `❌ PUNCH DENIED: You are ${distance}m away from "${selectedPunchSite.name}". Allowed radius is ${selectedPunchSite.radiusMeters}m.`
      });
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dailyRate = Math.round((selectedPunchWorker?.totalCtcSalary || 18000) / 30);
    let earned = dailyRate;
    if (punchStatusOption === 'Half Day') earned = Math.round(dailyRate / 2);
    earned += customOtHours * 120;

    const newLog: AttendanceLog = {
      id: `ATT-${Date.now()}`,
      workerCode: selectedPunchWorker.workerCode,
      workerName: selectedPunchWorker.name,
      skill: selectedPunchWorker.category,
      supplierName: selectedPunchWorker.supplierName,
      siteId: selectedPunchSite.id,
      siteName: selectedPunchSite.name,
      punchInTime: type === 'IN' ? timeString : '08:30 AM',
      punchOutTime: type === 'OUT' ? timeString : '--:--',
      dateStr: now.toISOString().split('T')[0],
      otHours: customOtHours,
      attendanceStatus: punchStatusOption,
      wageAmount: earned,
      remarks: punchRemarksInput || `${punchStatusOption} Logged`,
      lat: userLat || selectedPunchSite.lat,
      lng: userLng || selectedPunchSite.lng,
      distanceMeters: distance,
      isGeofenceValid: true
    };

    setAttendanceLogs(prev => [newLog, ...prev]);
    setPunchFeedback({
      success: true,
      message: `✅ PUNCH ${type} SUCCESSFUL: ${selectedPunchWorker.name} logged at ${selectedPunchSite.name} (${distance}m inside 50m radius).`
    });
  };

  const handleExport30DayExcel = () => {
    if (!activeGridWorker) return;
    const data = activeWorkerLogs.map((log, idx) => ({
      "Day #": idx + 1,
      "Date": log.dateStr,
      "Worker Code": log.workerCode,
      "Worker Name": log.workerName,
      "Category": log.skill,
      "Site": log.siteName,
      "In Time": log.punchInTime,
      "Out Time": log.punchOutTime,
      "Attendance Status": log.attendanceStatus,
      "OT Hours": log.otHours,
      "Daily Earned Wage (INR)": log.wageAmount,
      "Remarks": log.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeGridWorker.name}_30Day_Attendance`);
    XLSX.writeFile(wb, `BuildMitra_${activeGridWorker.workerCode}_30Day_Attendance_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportReportsExcel = () => {
    const data = workers.map(w => {
      const wLogs = attendanceLogs.filter(l => l.workerCode === w.workerCode);
      const daysPres = wLogs.filter(l => l.attendanceStatus !== 'Absent').length;
      const otTotal = wLogs.reduce((acc, l) => acc + l.otHours, 0);
      const gross = wLogs.reduce((acc, l) => acc + l.wageAmount, 0);
      const d = deductions[w.workerCode] || { advanceAmount: 0, damageFine: 0, lostMaterialPenalty: 0, otherDeductions: 0, notes: '' };
      const net = Math.max(0, gross - (d.advanceAmount + d.damageFine + d.lostMaterialPenalty + w.pfAmount + w.esiAmount));
      return {
        "Worker Code": w.workerCode,
        "Worker Name": w.name,
        "Mobile": w.mobile,
        "Category": w.category,
        "Assigned Location": w.siteName,
        "Job Allocated": w.jobAllocated,
        "Timings": w.workingTimings,
        "Monthly CTC (INR)": w.totalCtcSalary,
        "Basic (INR)": w.basicWage,
        "PF (INR)": w.pfAmount,
        "ESI (INR)": w.esiAmount,
        "Insurance (INR)": w.insuranceAmount,
        "Conveyance (INR)": w.conveyanceAmount,
        "Extra (INR)": w.extraAllowances,
        "Days Present": daysPres,
        "OT Hours": otTotal,
        "Gross Wages (INR)": gross,
        "Net Salary Payable (INR)": net
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master_Labour_Reports");
    XLSX.writeFile(wb, `BuildMitra_Master_Labour_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const mainContent = (
    <div style={{ padding: '16px', maxWidth: '1280px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '20px 24px', color: '#ffffff', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
              📍 LABOUR DB MASTER ATTENDANCE & PAYROLL SYSTEM
            </span>
            <h1 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👷 Master Labour DB: Geofence Attendance & 30-Day Payroll
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
              One-Time Master Entry, Monthly CTC (Basic+PF+ESI+Insurance+Conveyance), Auto-Calculated 30-Day Net Salary & Reports Hub.
            </p>
          </div>
          {!restrictedMode && (
            <button onClick={() => router.push("/laboursupply-dashboard")} style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#fff', border: 0, borderRadius: '8px', padding: '8px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              ← Labour Supply Dashboard
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>
        <button onClick={() => setActiveTab('grid30')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 0, fontWeight: '800', fontSize: '14px', cursor: 'pointer', backgroundColor: activeTab === 'grid30' ? '#800020' : '#e2e8f0', color: activeTab === 'grid30' ? '#fff' : '#475569' }}>
          📊 1. 30-Day Attendance Grid & Net Salary
        </button>
        <button onClick={() => setActiveTab('onboarding')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 0, fontWeight: '800', fontSize: '14px', cursor: 'pointer', backgroundColor: activeTab === 'onboarding' ? '#800020' : '#e2e8f0', color: activeTab === 'onboarding' ? '#fff' : '#475569' }}>
          📝 2. One-Time Master Labour Entry & App Invite
        </button>
        <button onClick={() => setActiveTab('punch')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 0, fontWeight: '800', fontSize: '14px', cursor: 'pointer', backgroundColor: activeTab === 'punch' ? '#800020' : '#e2e8f0', color: activeTab === 'punch' ? '#fff' : '#475569' }}>
          📲 3. Mobile 50m Geofence Punch Terminal
        </button>
        <button onClick={() => setActiveTab('reports')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 0, fontWeight: '800', fontSize: '14px', cursor: 'pointer', backgroundColor: activeTab === 'reports' ? '#800020' : '#e2e8f0', color: activeTab === 'reports' ? '#fff' : '#475569' }}>
          📈 4. Multi-Dimension Reports Hub
        </button>
      </div>

      {/* TAB 1: 30-DAY ATTENDANCE GRID & NET SALARY */}
      {activeTab === 'grid30' && (
        <div>
          {/* WORKER SELECTOR & EXPORT */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>Select Labour Profile:</label>
              <select value={selectedWorkerCode} onChange={(e) => setSelectedWorkerCode(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: '800', backgroundColor: '#fff', outline: 'none' }}>
                {workers.map(w => (
                  <option key={w.id} value={w.workerCode}>{w.name} ({w.category}) - {w.siteName.split(':')[0]} [{w.workerCode}]</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleSendWhatsAppInvite(activeGridWorker)} style={{ backgroundColor: '#25d366', color: '#fff', border: 0, borderRadius: '8px', padding: '8px 16px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                💬 Send App Invite Link
              </button>
              <button onClick={handleExport30DayExcel} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, borderRadius: '8px', padding: '8px 16px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                📊 Export 30-Day Excel
              </button>
            </div>
          </div>

          {/* MASTER WORKER PROFILE HEADER CARD */}
          {activeGridWorker && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '2px solid #800020', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <small style={{ color: '#800020', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}>LABOUR MASTER ID</small>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{activeGridWorker.name}</h2>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                    {activeGridWorker.category} [{activeGridWorker.workerCode}]
                  </span>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontWeight: '800', fontSize: '11px' }}>MOBILE & SITE LOCATION</small>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginTop: '4px' }}>📱 +91 {activeGridWorker.mobile}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>📍 {activeGridWorker.siteName}</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontWeight: '800', fontSize: '11px' }}>JOB ALLOCATED & TIMINGS</small>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginTop: '4px' }}>🛠️ {activeGridWorker.jobAllocated}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>⏱️ {activeGridWorker.workingTimings}</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontWeight: '800', fontSize: '11px' }}>MONTHLY CTC SALARY BREAKDOWN</small>
                  <div style={{ fontWeight: '900', fontSize: '18px', color: '#800020', marginTop: '4px' }}>₹{activeGridWorker.totalCtcSalary.toLocaleString()}/mo</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Basic: ₹{activeGridWorker.basicWage} | PF: ₹{activeGridWorker.pfAmount} | ESI: ₹{activeGridWorker.esiAmount} | Conv: ₹{activeGridWorker.conveyanceAmount}
                  </div>
                </div>
              </div>

              {/* AUTO-CALCULATED 30-DAY PAYROLL SUMMARY BAR */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', border: '1px solid #cbd5e1' }}>
                <div>
                  <small style={{ color: '#64748b', fontWeight: '800', fontSize: '11px' }}>DAYS PRESENT (30 DAYS)</small>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a' }}>{activeWorkerMetrics.daysPresent} / 30 Days</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontWeight: '800', fontSize: '11px' }}>TOTAL OVERTIME</small>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7' }}>{activeWorkerMetrics.otHours} hrs</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontWeight: '800', fontSize: '11px' }}>GROSS WAGES EARNED</small>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>₹{activeWorkerMetrics.grossEarned.toLocaleString()}</div>
                </div>
                <div>
                  <small style={{ color: '#dc2626', fontWeight: '800', fontSize: '11px' }}>PF+ESI+DEDUCTIONS</small>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626' }}>-₹{activeWorkerMetrics.deductionsTotal.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <small style={{ color: '#166534', fontWeight: '900', fontSize: '11px' }}>NET PAYABLE SALARY</small>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a' }}>₹{activeWorkerMetrics.netPayable.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* 30-DAY ATTENDANCE HISTORY GRID */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              📅 30-Day Attendance History Log (Neat Columns View)
            </h3>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800' }}>Day #</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800' }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800' }}>In Time</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800' }}>Out Time</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800' }}>Attendance Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800' }}>OT Hours</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>Daily Earned (₹)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWorkerLogs.map((log, idx) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: log.attendanceStatus === 'Absent' ? '#fef2f2' : idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#64748b' }}>Day {idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{log.dateStr}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: log.punchInTime !== '--:--' ? '#16a34a' : '#94a3b8', fontWeight: '800' }}>{log.punchInTime}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: log.punchOutTime !== '--:--' ? '#dc2626' : '#94a3b8', fontWeight: '800' }}>{log.punchOutTime}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '14px', fontSize: '11px', fontWeight: '900',
                          backgroundColor: log.attendanceStatus === 'Present' ? '#dcfce7' : log.attendanceStatus === 'Half Day' ? '#fef3c7' : log.attendanceStatus === 'Early Out' ? '#e0f2fe' : log.attendanceStatus === 'Late Come' ? '#ffedd5' : '#fee2e2',
                          color: log.attendanceStatus === 'Present' ? '#15803d' : log.attendanceStatus === 'Half Day' ? '#b45309' : log.attendanceStatus === 'Early Out' ? '#0369a1' : log.attendanceStatus === 'Late Come' ? '#c2410c' : '#b91c1c'
                        }}>
                          {log.attendanceStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#0284c7' }}>{log.otHours > 0 ? `+${log.otHours} hrs` : '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', color: '#800020' }}>₹{(log.wageAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONE-TIME MASTER LABOUR ENTRY FORM & INVITE */}
      {activeTab === 'onboarding' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: '#800020' }}>
            📝 One-Time Master Labour Entry & App Invite Generator
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
            Register worker profile once with monthly CTC (Basic+PF+ESI+Insurance+Conveyance). Generates auto Geofence Link for worker's mobile.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Labour Name</label>
              <input type="text" placeholder="Full Name..." value={newWorkerName} onChange={(e) => setNewWorkerName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Mobile Number</label>
              <input type="text" placeholder="10-digit mobile..." value={newWorkerMobile} onChange={(e) => setNewWorkerMobile(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Skill Category</label>
              <select value={newWorkerCategory} onChange={(e) => setNewWorkerCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="Mason">Mason</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Helper">Helper</option>
                <option value="Welder">Welder</option>
                <option value="Plumber">Plumber</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Assigned Project Site / Location</label>
              <select value={newWorkerSiteId} onChange={(e) => setNewWorkerSiteId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Type of Job Allocated</label>
              <input type="text" placeholder="e.g. Steel Structure Anchor Bolt Works" value={newWorkerJob} onChange={(e) => setNewWorkerJob(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Working Timings</label>
              <input type="text" placeholder="e.g. 08:30 AM - 05:30 PM" value={newWorkerTimings} onChange={(e) => setNewWorkerTimings(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
          </div>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', borderBottom: '2px solid #800020', paddingBottom: '6px' }}>
            💰 Monthly CTC Salary Structure (Basic + PF + ESI + Insurance + Conveyance)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Basic Wage (₹/mo)</label>
              <input type="number" value={newWorkerBasic} onChange={(e) => setNewWorkerBasic(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>PF Amount (₹/mo)</label>
              <input type="number" value={newWorkerPf} onChange={(e) => setNewWorkerPf(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>ESI Amount (₹/mo)</label>
              <input type="number" value={newWorkerEsi} onChange={(e) => setNewWorkerEsi(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Insurance Premium (₹/mo)</label>
              <input type="number" value={newWorkerInsurance} onChange={(e) => setNewWorkerInsurance(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Conveyance / Travel (₹/mo)</label>
              <input type="number" value={newWorkerConveyance} onChange={(e) => setNewWorkerConveyance(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Extra Allowances (₹/mo)</label>
              <input type="number" value={newWorkerExtra} onChange={(e) => setNewWorkerExtra(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <small style={{ color: '#166534', fontWeight: '900', fontSize: '12px' }}>TOTAL CALCULATED MONTHLY CTC SALARY</small>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: '900', color: '#15803d' }}>₹{calculatedTotalCtc.toLocaleString()}/month</h2>
            </div>
            <button onClick={handleCreateWorker} style={{ backgroundColor: '#800020', color: '#fff', border: 0, borderRadius: '10px', padding: '14px 28px', fontSize: '15px', fontWeight: '900', cursor: 'pointer' }}>
              💾 Save Worker Master Entry & Generate App Link
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PUNCH TERMINAL */}
      {activeTab === 'punch' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            📲 50-Meter GPS Mobile Punch Terminal
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Select Worker</label>
              <select value={selectedPunchWorkerCode} onChange={(e) => setSelectedPunchWorkerCode(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', backgroundColor: '#fff' }}>
                {workers.map(w => <option key={w.id} value={w.workerCode}>{w.name} ({w.category}) [{w.workerCode}]</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Project Site</label>
              <select value={selectedPunchSiteId} onChange={(e) => setSelectedPunchSiteId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', backgroundColor: '#fff' }}>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.radiusMeters}m Geofence)</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Status</label>
              <select value={punchStatusOption} onChange={(e: any) => setPunchStatusOption(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: '700', backgroundColor: '#fff' }}>
                <option value="Present">Present (Full Day)</option>
                <option value="Half Day">Half Day</option>
                <option value="Early Out">Early Out</option>
                <option value="Late Come">Late Come</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>OT Hours</label>
              <input type="number" min={0} value={customOtHours} onChange={(e) => setCustomOtHours(Number(e.target.value))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
            </div>
          </div>

          <div style={{ backgroundColor: calculatedDistance !== null && calculatedDistance <= selectedPunchSite.radiusMeters ? '#f0fdf4' : '#fef2f2', border: `2px solid ${calculatedDistance !== null && calculatedDistance <= selectedPunchSite.radiusMeters ? '#bbf7d0' : '#fecaca'}`, borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: calculatedDistance !== null && calculatedDistance <= selectedPunchSite.radiusMeters ? '#15803d' : '#b91c1c' }}>
              {calculatedDistance !== null ? `${calculatedDistance} METERS FROM SITE` : 'GPS REQUIRED'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: calculatedDistance !== null && calculatedDistance <= selectedPunchSite.radiusMeters ? '#166534' : '#991b1b', marginTop: '4px' }}>
              {calculatedDistance !== null && calculatedDistance <= selectedPunchSite.radiusMeters ? `✅ Verified Inside ${selectedPunchSite.radiusMeters}m Geofence Radius` : `❌ Outside Allowed Boundary (${calculatedDistance}m > ${selectedPunchSite.radiusMeters}m)`}
            </div>

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
              <button onClick={handleDetectLocation} disabled={isLocating} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                {isLocating ? 'Locating...' : '📍 Detect Live GPS'}
              </button>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Sim Slider:</span>
              <input type="range" min={0} max={150} value={simulatedDistance} onChange={(e) => setSimulatedDistance(Number(e.target.value))} style={{ width: '140px' }} />
            </div>
          </div>

          {punchFeedback && (
            <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: '800', fontSize: '13px', backgroundColor: punchFeedback.success ? '#dcfce7' : '#fee2e2', color: punchFeedback.success ? '#15803d' : '#b91c1c' }}>
              {punchFeedback.message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button onClick={() => handlePunch('IN')} style={{ padding: '16px', backgroundColor: '#16a34a', color: '#fff', border: 0, borderRadius: '10px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>🟢 PUNCH IN</button>
            <button onClick={() => handlePunch('OUT')} style={{ padding: '16px', backgroundColor: '#dc2626', color: '#fff', border: 0, borderRadius: '10px', fontSize: '16px', fontWeight: '900', cursor: 'pointer' }}>🔴 PUNCH OUT</button>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-DIMENSION REPORTS HUB */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#800020' }}>
                📈 Multi-Dimension Labour Reports Hub
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Filter & Export Attendance & Payroll by Location, Category, or Worker.</p>
            </div>
            <button onClick={handleExportReportsExcel} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, borderRadius: '8px', padding: '10px 20px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
              📊 Export Master Reports Excel
            </button>
          </div>

          {/* FILTERS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Filter by Location / Site</label>
              <select value={reportFilterSite} onChange={(e) => setReportFilterSite(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="all">All Locations / Sites</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>Filter by Category / Skill</label>
              <select value={reportFilterCategory} onChange={(e) => setReportFilterCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff' }}>
                <option value="all">All Categories</option>
                <option value="Mason">Mason</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Helper">Helper</option>
                <option value="Welder">Welder</option>
              </select>
            </div>
          </div>

          {/* MASTER SUMMARY TABLE */}
          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#800020', color: '#ffffff' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800' }}>Worker Code & Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800' }}>Category</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '800' }}>Location / Site</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>Monthly CTC</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800' }}>Days Present</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>Gross Earned</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>PF + ESI</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', backgroundColor: '#166534' }}>NET PAYABLE</th>
                </tr>
              </thead>
              <tbody>
                {workers
                  .filter(w => (reportFilterSite === 'all' || w.siteId === reportFilterSite) && (reportFilterCategory === 'all' || w.category === reportFilterCategory))
                  .map(w => {
                    const wLogs = attendanceLogs.filter(l => l.workerCode === w.workerCode);
                    const daysPres = wLogs.filter(l => l.attendanceStatus !== 'Absent').length;
                    const gross = wLogs.reduce((acc, l) => acc + l.wageAmount, 0);
                    const d = deductions[w.workerCode] || { advanceAmount: 0, damageFine: 0, lostMaterialPenalty: 0, otherDeductions: 0, notes: '' };
                    const net = Math.max(0, gross - (d.advanceAmount + d.damageFine + d.lostMaterialPenalty + w.pfAmount + w.esiAmount));

                    return (
                      <tr key={w.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <strong>{w.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>[{w.workerCode}]</div>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '700' }}>{w.category}</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{w.siteName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{w.totalCtcSalary.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#16a34a' }}>{daysPres} / 30 Days</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800' }}>₹{gross.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626' }}>-₹{(w.pfAmount + w.esiAmount).toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '900', fontSize: '15px', color: '#15803d', backgroundColor: '#f0fdf4' }}>₹{net.toLocaleString()}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );

  if (restrictedMode) {
    return (
      <>
        <Head>
          <title>BuildMitra Labour Attendance App</title>
        </Head>
        {mainContent}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Master Labour DB & 30-Day Payroll | BuildMitra</title>
      </Head>
      <Sidebar currentPath="/labour-attendance">
        {mainContent}
      </Sidebar>
    </>
  );
}
