/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import { 
  ShieldAlert, RefreshCw, Send, Check, X, ShieldCheck, 
  HelpCircle, Trash2, Heart, Plus, Users, LayoutDashboard, 
  Settings, Database, FileText, AlertTriangle, KeyRound, Radio, Shield, Filter,
  TrendingUp, Activity, Server, Clock
} from 'lucide-react';

import { addLicenseSync, updateLicenseSync, deleteLicenseSync } from '../firebaseSync';

export default function SuperAdminPanel({
  hospitals,
  branches,
  tickets,
  auditLogs,
  branchAdmins,
  licenses = [],
  onAddHospital,
  onToggleHospitalState,
  onAddBranch,
  onResolveTicket,
  onTriggerGlobalBroadcast,
  onTriggerSystemBackup,
  onWipeDatabase,
  onAddBranchAdmin,
  onToggleBranchAdminStatus,
  onDeleteBranchAdmin,
  doctors,
  patients
}) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Dynamic SaaS Licensing Tiers State and Handlers
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [newLicName, setNewLicName] = useState('');
  const [newLicDesc, setNewLicDesc] = useState('');
  const [newLicPrice, setNewLicPrice] = useState('');
  const [newLicDuration, setNewLicDuration] = useState('month');

  const [editingLicId, setEditingLicId] = useState(null);
  const [editLicName, setEditLicName] = useState('');
  const [editLicDesc, setEditLicDesc] = useState('');
  const [editLicPrice, setEditLicPrice] = useState('');
  const [editLicDuration, setEditLicDuration] = useState('month');
  const [deletingLicId, setDeletingLicId] = useState(null);

  const handleAddLicenseSubmit = async (e) => {
    e.preventDefault();
    if (!newLicName.trim() || !newLicPrice) return;
    const priceNum = parseFloat(newLicPrice);
    if (isNaN(priceNum)) return;

    await addLicenseSync({
      name: newLicName.trim(),
      description: newLicDesc.trim(),
      price: priceNum,
      duration: newLicDuration
    });

    setNewLicName('');
    setNewLicDesc('');
    setNewLicPrice('');
    setNewLicDuration('month');
    setShowAddLicense(false);
  };

  const handleEditClick = (lic) => {
    setEditingLicId(lic.id);
    setEditLicName(lic.name);
    setEditLicDesc(lic.description || '');
    setEditLicPrice(lic.price);
    setEditLicDuration(lic.duration || 'month');
  };

  const handleSaveEditLicense = async (id) => {
    if (!editLicName.trim() || !editLicPrice) return;
    const priceNum = parseFloat(editLicPrice);
    if (isNaN(priceNum)) return;

    await updateLicenseSync(id, {
      name: editLicName.trim(),
      description: editLicDesc.trim(),
      price: priceNum,
      duration: editLicDuration
    });

    setEditingLicId(null);
  };

  const handleDeleteLicenseClick = (id) => {
    setDeletingLicId(id);
  };

  const handleConfirmDeleteLicense = async (id) => {
    await deleteLicenseSync(id);
    setDeletingLicId(null);
  };

  // Real-time operations stats states for Super Admin Dashboard
  const [liveTraffic, setLiveTraffic] = useState([
    { time: '10:00 AM', bandwidth: 420, transactions: 15 },
    { time: '10:30 AM', bandwidth: 512, transactions: 24 },
    { time: '11:00 AM', bandwidth: 380, transactions: 19 },
    { time: '11:30 AM', bandwidth: 620, transactions: 32 },
    { time: '12:00 PM', bandwidth: 490, transactions: 28 },
    { time: '12:30 PM', bandwidth: 550, transactions: 35 },
    { time: '01:00 PM', bandwidth: 710, transactions: 44 },
    { time: '01:30 PM', bandwidth: 640, transactions: 40 },
  ]);

  const [liveSlaDistribution, setLiveSlaDistribution] = useState([
    { name: 'Unassigned', value: 4 },
    { name: 'Escalated', value: 8 },
    { name: 'In Progress', value: 12 },
    { name: 'Resolved', value: 22 },
  ]);

  const [liveHospitalLoads, setLiveHospitalLoads] = useState({});

  useEffect(() => {
    // Keep liveHospitalLoads synchronized with hospitals
    setLiveHospitalLoads(prev => {
      const next = { ...prev };
      let updated = false;
      hospitals.forEach(h => {
        if (next[h.id] === undefined) {
          // Identify associated details to compute base load
          const hospBranches = branches.filter(b => b.hospitalId === h.id);
          const branchIds = hospBranches.map(b => b.id);
          const hospPatients = patients ? patients.filter(p => branchIds.includes(p.branchId)) : [];
          const hospDoctors = doctors ? doctors.filter(d => branchIds.includes(d.branchId)) : [];
          // Calculate an active base load
          const baseLoad = (hospBranches.length * 20) + (hospPatients.length * 10) + (hospDoctors.length * 5);
          next[h.id] = Math.max(baseLoad, 18);
          updated = true;
        }
      });
      // Remove deleted/absent hospitals
      Object.keys(next).forEach(id => {
        if (!hospitals.some(h => h.id === id)) {
          delete next[id];
          updated = true;
        }
      });
      return updated ? next : prev;
    });
  }, [hospitals, branches, patients, doctors]);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Shift real-time grid traffic
      setLiveTraffic(prev => {
        const next = [...prev];
        next.shift();
        const lastHour = next[next.length - 1].time;
        const [timePart, ampm] = lastHour.split(' ');
        let [hr, min] = timePart.split(':').map(Number);
        min += 30;
        if (min >= 60) {
          min -= 60;
          hr += 1;
          if (hr > 12) hr = 1;
        }
        const minStr = min < 10 ? `0${min}` : min;
        const nextTime = `${hr}:${minStr} ${ampm}`;
        
        const bw = Math.min(Math.max(Math.floor(520 + (Math.random() - 0.5) * 350), 150), 980);
        const tx = Math.min(Math.max(Math.floor(35 + (Math.random() - 0.5) * 30), 8), 75);
        
        next.push({ time: nextTime, bandwidth: bw, transactions: tx });
        return next;
      });

      // 2. Fluctuate SLA distribute slightly
      setLiveSlaDistribution(prev => {
        return prev.map(item => {
          let delta = Math.floor((Math.random() - 0.5) * 4);
          let newVal = Math.max(item.value + delta, 1);
          return { ...item, value: newVal };
        });
      });

      // 3. Fluctuate Hospital Load Balance ratios
      setLiveHospitalLoads(prev => {
        const next = { ...prev };
        let modified = false;
        Object.keys(next).forEach(id => {
          let delta = Math.floor((Math.random() - 0.5) * 6);
          next[id] = Math.max(next[id] + delta, 5);
          modified = true;
        });
        return modified ? next : prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Filter States
  const [hospFilterText, setHospFilterText] = useState('');
  const [hospFilterTier, setHospFilterTier] = useState('All');
  const [rbacFilterText, setRbacFilterText] = useState('');
  const [rbacFilterStatus, setRbacFilterStatus] = useState('All');
  const [docFilterText, setDocFilterText] = useState('');
  const [docFilterState, setDocFilterState] = useState('All');
  const [patFilterText, setPatFilterText] = useState('');
  const [patFilterState, setPatFilterState] = useState('All');
  const [ticketFilterPriority, setTicketFilterPriority] = useState('All');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('All');
  const [auditFilterUser, setAuditFilterUser] = useState('All');

  // New Hospital Form states
  const [showHospModal, setShowHospModal] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospCode, setHospCode] = useState('');
  const [hospTier, setHospTier] = useState('Standard');
  const [hospEmail, setHospEmail] = useState('');

  // New Branch Form states
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchHospId, setBranchHospId] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchBeds, setBranchBeds] = useState(30);

  // Broadcast Message states
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Backup states
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Branch Admin / RBAC states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminBranchId, setAdminBranchId] = useState('');
  const [adminPerms, setAdminPerms] = useState(['Billing Management', 'Bed Lifecycle Control']);

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminBranchId) return;
    const br = branches.find(b => b.id === adminBranchId);
    onAddBranchAdmin({
      name: adminName,
      branchId: adminBranchId,
      branchName: br ? br.name : 'Unknown Branch',
      status: 'Active',
      email: adminEmail,
      permissions: adminPerms
    });
    setAdminName('');
    setAdminEmail('');
    setAdminBranchId('');
    setShowAdminModal(false);
  };

  const handleHospSubmit = (e) => {
    e.preventDefault();
    if (!hospName || !hospCode || !hospEmail) return;
    onAddHospital({
      name: hospName,
      code: hospCode.toUpperCase(),
      tier: hospTier,
      isActive: true,
      contactEmail: hospEmail
    });
    setHospName('');
    setHospCode('');
    setHospEmail('');
    setShowHospModal(false);
  };

  const handleBranchSubmit = (e) => {
    e.preventDefault();
    if (!branchHospId || !branchName || !branchCity) return;
    onAddBranch({
      hospitalId: branchHospId,
      name: branchName,
      city: branchCity,
      bedsTotal: Number(branchBeds)
    });
    setBranchName('');
    setBranchCity('');
    setBranchBeds(30);
    setBranchHospId('');
    setShowBranchModal(false);
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    onTriggerGlobalBroadcast(broadcastMessage);
    setBroadcastMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleBackupClick = () => {
    setBackupLoading(true);
    onTriggerSystemBackup();
    setTimeout(() => {
      setBackupLoading(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Super Admin Top Context Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-sans">Super Administrator Command</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sans">Control global licensing tiers, provision hospital nodes, manage tickets logs, and monitor structural audit records.</p>
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowHospModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Provision Hospital
          </button>
          <button
            onClick={() => setShowBranchModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-350" />
            Launch Branch Node
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hospitals Enrolled</span>
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{hospitals.length} Tenants</div>
          <p className="text-[10px] text-slate-505 mt-1">Active nodes: {hospitals.filter(h => h.isActive).length}</p>
        </div>

        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Branch Nodes</span>
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{branches.length} Locations</div>
          <p className="text-[10px] text-slate-505 mt-1">Average capacity: 32 beds / Node</p>
        </div>

        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tech Tickets</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {tickets.filter(t => t.status === 'Open').length} Pending
          </div>
          <p className="text-[10px] text-slate-550 mt-1">SLA compliant resolution rating</p>
        </div>

        <div className="p-4 bg-white border border-slate-250 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Security trails</span>
            <FileText className="w-5 h-5 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">✔ SECURE</div>
          <p className="text-[10px] text-slate-505 mt-1">Last activity entry: 1 minute ago</p>
        </div>
      </div>

      {/* Structural Sub-Tabs for Super Admin in Pop Left Navigation Block */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-6 w-full">
        {/* Left Navigation Block Section */}
        <div className={`transition-all duration-305 shrink-0 ${isNavCollapsed ? 'lg:w-16 w-full' : 'lg:w-64 w-full'} lg:sticky lg:top-4 w-full`}>
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              {!isNavCollapsed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Super Admin Menu</span>}
              <button
                type="button"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors ml-auto text-xs font-bold focus:outline-none"
                title={isNavCollapsed ? "Expand Menu" : "Collapse Menu"}
              >
                {isNavCollapsed ? "▶" : "◀"}
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard Metrics', icon: LayoutDashboard },
                { id: 'hospitals', label: 'Manage Hospitals', badge: hospitals.length, icon: ShieldCheck },
                { id: 'rbac', label: 'Branch Admins & RBAC', badge: branchAdmins.length, icon: KeyRound },
                { id: 'directory', label: 'Global Case Directory', badge: doctors.length + patients.length, icon: Users },
                { id: 'tickets', label: 'Support Tickets', badge: tickets.filter(t => t.status === 'Open').length, icon: ShieldAlert },
                { id: 'compliance', label: 'Security & Compliance', icon: Shield },
                { id: 'cloud', label: 'Cloud Snapshots', icon: Database }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800 text-white font-bold border-l-4 border-indigo-505 pl-1.5' 
                        : 'text-slate-400 hover:text-slate-205 hover:bg-slate-850'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {!isNavCollapsed && (
                      <span className="text-xs truncate flex-1 flex items-center justify-between">
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-indigo-600 text-white font-mono rounded-full font-bold animate-pulse">
                            {tab.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 w-full lg:min-w-0 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Broadcast Alert Trigger */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest bg-rose-500 text-white font-extrabold uppercase rounded">
                System Announcement
              </span>
              <h2 className="text-xl font-bold tracking-tight">Post Global Announcement</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                Sends a high-priority advisory notification visible across all user dashboard portals instantly.
              </p>

              <form onSubmit={handleBroadcastSubmit} className="space-y-3 pt-2 font-sans">
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  placeholder="Enter system broadcast message here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-hidden text-slate-200"
                />
                
                <button
                  type="submit"
                  id="btn-deploy-broadcast"
                  className="w-full bg-rose-650 hover:bg-rose-705 text-white font-bold tracking-wider text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Live Announcement
                </button>

                {broadcastSuccess && (
                  <div className="text-center font-bold text-xs text-emerald-455 animate-bounce mt-2">
                    📢 Global Announcement Published!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Tenant Licensing Tiers Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-mono">Tenant Licensing Tiers</h3>
                <button
                  type="button"
                  onClick={() => setShowAddLicense(!showAddLicense)}
                  className="text-xs flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddLicense ? 'Hide Form' : 'Add License'}
                </button>
              </div>

              {/* Add form */}
              {showAddLicense && (
                <form onSubmit={handleAddLicenseSubmit} className="p-3 bg-slate-50 border border-indigo-100 rounded-xl space-y-3 animate-fade-in text-xs">
                  <span className="font-bold text-slate-800 text-xs block font-sans">New Tier Details</span>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">License Type</label>
                      <input
                        type="text"
                        value={newLicName}
                        onChange={(e) => setNewLicName(e.target.value)}
                        placeholder="e.g. Premium Tier"
                        className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                      <input
                        type="text"
                        value={newLicDesc}
                        onChange={(e) => setNewLicDesc(e.target.value)}
                        placeholder="e.g. Unlimited EHR data prescriptions"
                        className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price ($)</label>
                        <input
                          type="number"
                          value={newLicPrice}
                          onChange={(e) => setNewLicPrice(e.target.value)}
                          placeholder="e.g. 199"
                          className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                          min="0"
                          step="any"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billing Cycle</label>
                        <input
                          type="text"
                          value={newLicDuration}
                          onChange={(e) => setNewLicDuration(e.target.value)}
                          placeholder="e.g. month, week, year, quarter"
                          className="w-full mt-1 p-1.5 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddLicense(false)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-[11px] bg-indigo-600 text-white font-semibold hover:bg-indigo-700 rounded transition cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Licenses List */}
              <div className="space-y-3 mt-4 max-h-[350px] overflow-y-auto pr-1">
                {licenses.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs italic">
                    No licensing tiers configured.
                  </div>
                ) : (
                  licenses.map((lic) => {
                    const isEditing = editingLicId === lic.id;
                    
                    const getBillingCycleShort = (dur) => {
                      if (!dur) return 'Mo';
                      const lowered = dur.toLowerCase();
                      if (lowered === 'week' || lowered === 'weekly') return 'Wk';
                      if (lowered === 'month' || lowered === 'monthly') return 'Mo';
                      if (lowered === 'year' || lowered === 'yearly') return 'Yr';
                      return dur.length > 5 ? dur.slice(0, 3) + '.' : dur;
                    };

                    const getBillingCycleLong = (dur) => {
                      if (!dur) return 'Monthly';
                      const lowered = dur.toLowerCase();
                      if (lowered === 'week') return 'Weekly';
                      if (lowered === 'month') return 'Monthly';
                      if (lowered === 'year') return 'Yearly';
                      return dur;
                    };

                    const billingCycleLabel = getBillingCycleShort(lic.duration);
                    const durationFullLabel = getBillingCycleLong(lic.duration);

                    if (isEditing) {
                      return (
                        <div key={lic.id} className="p-3 bg-slate-50 border border-indigo-250 rounded-xl space-y-2 animate-fade-in text-xs">
                          <span className="font-bold text-indigo-700 text-xs block font-sans">Edit Licensing Tier</span>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">License Type</label>
                            <input
                              type="text"
                              value={editLicName}
                              onChange={(e) => setEditLicName(e.target.value)}
                              className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                            <input
                              type="text"
                              value={editLicDesc}
                              onChange={(e) => setEditLicDesc(e.target.value)}
                              className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Price ($)</label>
                              <input
                                type="number"
                                value={editLicPrice}
                                onChange={(e) => setEditLicPrice(e.target.value)}
                                className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Billing Cycle</label>
                              <input
                                type="text"
                                value={editLicDuration}
                                onChange={(e) => setEditLicDuration(e.target.value)}
                                placeholder="e.g. month"
                                className="w-full mt-0.5 p-1 border border-slate-250 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingLicId(null)}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditLicense(lic.id)}
                              className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white font-semibold hover:bg-emerald-700 rounded transition cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const isDeleting = deletingLicId === lic.id;

                    if (isDeleting) {
                      return (
                        <div key={lic.id} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex justify-between items-center text-xs animate-fade-in">
                          <div className="space-y-0.5">
                            <span className="font-bold text-rose-800 block font-sans">Delete "{lic.name}"?</span>
                            <span className="text-rose-500 text-[11px]">This licensing tier will be permanently removed.</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDeletingLicId(null)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteLicense(lic.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={lic.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs hover:border-slate-350 transition group">
                        <div className="space-y-0.5 max-w-[65%]">
                          <span className="font-bold text-slate-850 block truncate font-sans">{lic.name}</span>
                          <span className="text-slate-500 block truncate" title={lic.description}>{lic.description || 'No description provided'}</span>
                          <span className="inline-block text-[10px] px-1.5 py-0.2 bg-indigo-50 border border-indigo-100 text-indigo-600 font-medium rounded-full mt-1 capitalize font-sans">
                            {durationFullLabel}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <strong className="text-slate-800 text-sm font-mono">${(Number(lic.price) || 0).toLocaleString()}/{billingCycleLabel}</strong>
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => handleEditClick(lic)}
                              title="Edit tier"
                              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteLicenseClick(lic.id)}
                              title="Delete tier"
                              className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Real-time Global Systems Dashboard Charts - Creative Mobile-Responsive Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6" id="super-admin-live-ops-dashboard">
          {/* Chart 1: Live SaaS Operations Bandwidth & Network Queries (Area Chart) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Live Operational Bandwidth & API Query Latency</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full bg-slate-50/40 border border-slate-150 rounded-lg p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveTraffic} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  <Area type="monotone" dataKey="bandwidth" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBandwidth)" name="API Requests Rate (req/m)" />
                  <Area type="monotone" dataKey="transactions" stroke="#0ea5e9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTransactions)" name="Payload Latency (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Live SLA incident level (Bar Chart) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Incident Support Tickets Load</h4>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveSlaDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {liveSlaDistribution.map((entry, index) => {
                      const colors = ['#ef4444', '#f59e0b', '#0ea5e9', '#10b981'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[11px] space-y-1 text-slate-650 font-semibold">
              <div className="flex justify-between">
                <span>Total Active Tickets:</span>
                <span className="font-mono text-slate-800">{tickets.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Urgent Escalate Ratio:</span>
                <span className="font-mono text-rose-600">
                  {Math.round((liveSlaDistribution.find(i=>i.name==='Escalated')?.value || 0) / (tickets.length || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart 3: Live Hospital Load Share balancing (Pie Chart) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="pb-2 border-b border-slate-100 mb-2">
              <h4 className="text-sm font-bold text-slate-800">Hospital Load Balance Ratio</h4>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const COLORS = [
                        '#10b981', // emerald
                        '#3b82f6', // blue
                        '#6366f1', // indigo
                        '#ec4899', // pink
                        '#f59e0b', // amber
                        '#8b5cf6', // violet
                        '#14b8a6', // teal
                        '#f43f5e', // rose
                      ];
                      return hospitals.map((h, idx) => ({
                        name: h.name,
                        value: liveHospitalLoads[h.id] !== undefined ? liveHospitalLoads[h.id] : 20,
                        color: COLORS[idx % COLORS.length]
                      }));
                    })()}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(() => {
                      const COLORS = [
                        '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#14b8a6', '#f43f5e'
                      ];
                      return hospitals.map((h, idx) => (
                        <Cell key={`cell-${h.id}`} fill={COLORS[idx % COLORS.length]} />
                      ));
                    })()}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800">
                  {hospitals.reduce((acc, h) => acc + (liveHospitalLoads[h.id] !== undefined ? liveHospitalLoads[h.id] : 20), 0)}
                </span>
                <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">Total Load</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-around text-[10px] font-bold text-slate-600 px-2 border-t border-slate-100 pt-3">
              {(() => {
                const COLORS = [
                  '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#14b8a6', '#f43f5e'
                ];
                return hospitals.map((h, idx) => (
                  <div key={h.id} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate max-w-[80px]">{h.name.split(' ')[0]} ({liveHospitalLoads[h.id] !== undefined ? liveHospitalLoads[h.id] : 20})</span>
                  </div>
                ));
              })()}
              {hospitals.length === 0 && (
                <span className="text-xs text-slate-400 font-medium italic">No registered hospitals</span>
              )}
            </div>
          </div>
        </div>
            </>
          )}

      {activeTab === 'hospitals' && (() => {
        const filteredHospitals = hospitals.filter(h => {
          const matchesText = h.name.toLowerCase().includes(hospFilterText.toLowerCase()) || 
            h.code.toLowerCase().includes(hospFilterText.toLowerCase()) || 
            h.contactEmail.toLowerCase().includes(hospFilterText.toLowerCase());
          const matchesTier = hospFilterTier === 'All' || h.tier === hospFilterTier;
          return matchesText && matchesTier;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-205 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Hospital Tenants</span>
              <button
                onClick={() => setShowHospModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-slate-800"
              >
                + Provision Hospital
              </button>
            </div>

            {/* Hospital Filter Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                Filter By:
              </span>
              <input
                type="text"
                placeholder="Search hospital name or code..."
                value={hospFilterText}
                onChange={(e) => setHospFilterText(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-60 focus:outline-none"
              />
              <select
                value={hospFilterTier}
                onChange={(e) => setHospFilterTier(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Tiers</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Standard">Standard</option>
                <option value="Basic">Basic</option>
              </select>
              {(hospFilterText !== '' || hospFilterTier !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setHospFilterText(''); setHospFilterTier('All'); }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto text-sm text-slate-705">
              <table className="w-full">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Hospital Identity</th>
                    <th className="px-5 py-3 text-center font-semibold">Node Code</th>
                    <th className="px-5 py-3 text-center font-semibold">Plan Tier</th>
                    <th className="px-5 py-3 text-center font-semibold">Branches Count</th>
                    <th className="px-5 py-3 text-center font-semibold">Service state</th>
                    <th className="px-5 py-3 text-right font-semibold">Licensing Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredHospitals.map((hosp) => (
                    <tr key={hosp.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{hosp.name}</span>
                          <span className="text-xs text-slate-500 font-mono block">Contact: {hosp.contactEmail} • Joined: {hosp.joinedDate}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-semibold text-indigo-650">{hosp.code}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                          hosp.tier === 'Enterprise' ? 'bg-indigo-50 border-indigo-205 text-indigo-705 font-bold' :
                          hosp.tier === 'Standard' ? 'bg-teal-50 border-teal-205 text-teal-705' :
                          'bg-slate-50 border-slate-205 text-slate-705'
                        }`}>
                          {hosp.tier}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-bold">{hosp.branchesCount}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-0.5 text-xs rounded-md ${
                          hosp.isActive ? 'bg-emerald-100 text-emerald-805 font-semibold' : 'bg-rose-105 text-rose-805 font-semibold'
                        }`}>
                          {hosp.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onToggleHospitalState(hosp.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer border transition-colors ${
                            hosp.isActive 
                              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                              : 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {hosp.isActive ? 'Deactivate Node' : 'Activate Node'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredHospitals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No hospital nodes match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {activeTab === 'rbac' && (() => {
        const filteredAdmins = branchAdmins.filter(adm => {
          const matchesText = adm.name.toLowerCase().includes(rbacFilterText.toLowerCase()) || 
            adm.email.toLowerCase().includes(rbacFilterText.toLowerCase()) || 
            adm.branchName.toLowerCase().includes(rbacFilterText.toLowerCase());
          const matchesStatus = rbacFilterStatus === 'All' || adm.status === rbacFilterStatus;
          return matchesText && matchesStatus;
        });

        return (
          <div className="space-y-4 font-sans">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block font-sans">Branch Administrators</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Manage localized branch administrator accounts and permissions.</p>
                </div>
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 font-bold hover:bg-indigo-700 text-white text-xs rounded-lg cursor-pointer"
                >
                  + Appoint Branch Admin
                </button>
              </div>

              {/* RBAC Filter Bar */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  Filter By:
                </span>
                <input
                  type="text"
                  placeholder="Search admin name, email, or branch..."
                  value={rbacFilterText}
                  onChange={(e) => setRbacFilterText(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-60 focus:outline-none"
                />
                <select
                  value={rbacFilterStatus}
                  onChange={(e) => setRbacFilterStatus(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {(rbacFilterText !== '' || rbacFilterStatus !== 'All') && (
                  <button
                    type="button"
                    onClick={() => { setRbacFilterText(''); setRbacFilterStatus('All'); }}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="overflow-x-auto text-sm text-slate-705">
                <table className="w-full">
                  <thead className="bg-slate-100 text-xs text-slate-550 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Administrator Name</th>
                      <th className="px-5 py-3 text-left font-semibold">Assigned Facility Branch</th>
                      <th className="px-5 py-3 text-left font-semibold">Scoped Permissions Role</th>
                      <th className="px-5 py-3 text-center font-semibold">Identity Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Access control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredAdmins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/50 font-sans">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-750 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {adm.name.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{adm.name}</span>
                              <span className="text-xs text-slate-500 font-mono block">{adm.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 italic text-slate-800 font-medium font-sans">{adm.branchName}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {adm.permissions.map((p, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-100 border border-slate-205 text-slate-600 text-[10px] font-medium rounded-md font-sans">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                            adm.status === 'Active' ? 'bg-emerald-50 text-emerald-805 border border-emerald-250' : 
                            adm.status === 'Pending' ? 'bg-amber-50 text-amber-850 border border-amber-250 animate-pulse' :
                            'bg-rose-50 text-rose-805 border border-rose-250'
                          }`}>
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          <div className="flex justify-end items-center gap-2">
                            {adm.status === 'Pending' ? (
                              <button
                                onClick={() => onToggleBranchAdminStatus(adm.id)}
                                className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer border border-emerald-600 shadow-sm inline-block whitespace-nowrap"
                              >
                                Approve Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleBranchAdminStatus(adm.id)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                                  adm.status === 'Active' ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                {adm.status === 'Active' ? 'Log out' : 'Authorize key'}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete the identity/request for ${adm.name}?`)) {
                                  if (onDeleteBranchAdmin) onDeleteBranchAdmin(adm.id);
                                }
                              }}
                              className="p-1.5 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold whitespace-nowrap"
                              title="Delete request or active registry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdmins.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                          No branch administrators match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'directory' && (() => {
        const filteredDoctors = doctors.filter(doc => {
          const matchesText = doc.name.toLowerCase().includes(docFilterText.toLowerCase()) || 
            doc.specialty.toLowerCase().includes(docFilterText.toLowerCase());
          const matchesState = docFilterState === 'All' || doc.availability === docFilterState;
          return matchesText && matchesState;
        });

        const filteredPatients = patients.filter(pat => {
          const matchesText = pat.name.toLowerCase().includes(patFilterText.toLowerCase()) || 
            pat.phone.toLowerCase().includes(patFilterText.toLowerCase());
          const matchesState = patFilterState === 'All' || pat.status === patFilterState;
          return matchesText && matchesState;
        });

        return (
          <div className="space-y-4 animate-fade-in font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctors Global Directory */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Physicians & Consult Specialists Directory</span>
                    <p className="text-[10px] text-slate-500 font-mono">Macro operational rosters across all clinical child nodes</p>
                  </div>

                  {/* Doctor local filter bar */}
                  <div className="bg-slate-50 border-b border-slate-150 p-2.5 flex flex-wrap gap-2 items-center text-xs">
                    <Filter className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter doctor or specialty..."
                      value={docFilterText}
                      onChange={(e) => setDocFilterText(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none flex-1 min-w-[120px]"
                    />
                    <select
                      value={docFilterState}
                      onChange={(e) => setDocFilterState(e.target.value)}
                      className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none"
                    >
                      <option value="All">All statuses</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>

                  <div className="max-h-[350px] overflow-auto text-xs font-sans">
                    <table className="w-full">
                      <thead className="bg-slate-100 stroke-slate-205 text-[10px] uppercase font-mono tracking-wider text-slate-505">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Specialist</th>
                          <th className="px-4 py-2 text-left font-semibold">Medical specialty</th>
                          <th className="px-4 py-2 text-center font-semibold">Service state</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredDoctors.map(doc => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 font-sans">
                            <td className="px-4 py-3 font-bold text-slate-850 font-sans">{doc.name}</td>
                            <td className="px-4 py-3 font-semibold text-indigo-650 font-sans">{doc.specialty}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                doc.availability === 'On Duty' ? 'bg-emerald-50 text-emerald-805 border border-emerald-250' :
                                doc.availability === 'Emergency' ? 'bg-amber-50 text-amber-805 border border-amber-250' :
                                'bg-slate-50 text-slate-500 border border-slate-200'
                              }`}>
                                {doc.availability}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredDoctors.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center py-6 text-slate-400">No doctors match current filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Patients Active Cases */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Active Diagnosed Patient Register</span>
                    <p className="text-[10px] text-slate-500 font-mono">Consolidated demographic indexes spanning all clinical divisions</p>
                  </div>

                  {/* Patient local filter bar */}
                  <div className="bg-slate-50 border-b border-slate-150 p-2.5 flex flex-wrap gap-2 items-center text-xs">
                    <Filter className="w-3.5 h-3.5 text-rose-550 shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter patient name or phone..."
                      value={patFilterText}
                      onChange={(e) => setPatFilterText(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none flex-1 min-w-[120px]"
                    />
                    <select
                      value={patFilterState}
                      onChange={(e) => setPatFilterState(e.target.value)}
                      className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none"
                    >
                      <option value="All">All states</option>
                      <option value="Inpatient">Inpatient</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>

                  <div className="max-h-[350px] overflow-auto text-xs">
                    <table className="w-full">
                      <thead className="bg-slate-100 text-[10px] uppercase font-mono tracking-wider text-slate-505">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Patient Case Profile</th>
                          <th className="px-4 py-2 text-center font-semibold">Blood Variant</th>
                          <th className="px-4 py-2 text-right font-semibold">Admit state</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-sans">
                        {filteredPatients.map(pat => (
                          <tr key={pat.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-855 block">{pat.name}</span>
                              <span className="text-[10px] text-slate-505 font-mono block">Age: {pat.age}y • Contact: {pat.phone}</span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-rose-600 font-mono">{pat.bloodGroup}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                pat.status === 'Inpatient' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans' :
                                pat.status === 'Discharged' ? 'bg-slate-50 text-slate-500 border border-slate-200 font-sans' :
                                'bg-emerald-50 text-emerald-800 border border-emerald-250 font-sans'
                              }`}>
                                {pat.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredPatients.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center py-6 text-slate-400">No patients match current filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'tickets' && (() => {
        const filteredTickets = tickets.filter(tkt => {
          const matchesPriority = ticketFilterPriority === 'All' || tkt.priority === ticketFilterPriority;
          const matchesStatus = ticketFilterStatus === 'All' || tkt.status === ticketFilterStatus;
          return matchesPriority && matchesStatus;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs font-sans">
            <div className="p-4 border-b border-slate-205 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Global Support Ticket Logs</span>
            </div>

            {/* Support Ticket Filters */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                <Filter className="w-3.5 h-3.5 text-indigo-650" />
                Filter By:
              </span>
              <select
                value={ticketFilterPriority}
                onChange={(e) => setTicketFilterPriority(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={ticketFilterStatus}
                onChange={(e) => setTicketFilterStatus(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All statuses</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
              {(ticketFilterPriority !== 'All' || ticketFilterStatus !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setTicketFilterPriority('All'); setTicketFilterStatus('All'); }}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-150">
              {filteredTickets.map(tkt => (
                <div key={tkt.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 font-sans">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-450 border border-slate-200 px-1.5 py-0.5 rounded">
                        #{tkt.id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm font-sans">{tkt.subject}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        tkt.priority === 'High' ? 'bg-rose-105 text-rose-805 border border-rose-200' :
                        tkt.priority === 'Medium' ? 'bg-amber-105 text-amber-805 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {tkt.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-655 pt-1 leading-relaxed font-sans">{tkt.description}</p>
                    
                    <div className="text-[11px] text-slate-500 font-mono">
                      Node: <strong className="text-slate-800">{tkt.hospitalName}</strong> | Authored By: {tkt.raisedBy} | Created: {tkt.createdDate}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {tkt.status === 'Open' ? (
                      <button
                        onClick={() => onResolveTicket(tkt.id)}
                        className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-xs text-emerald-750 bg-emerald-50 font-bold rounded-lg border border-emerald-150 inline-block font-sans">
                        Resolved ✔
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-sans">
                  No support tickets match the current filters.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === 'compliance' && (() => {
        const filteredLogs = auditLogs.filter(log => {
          const matchesUser = auditFilterUser === 'All' || log.userType === auditFilterUser;
          return matchesUser;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs font-sans">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Global Audit Activity Ledger Trail</span>
            </div>

            {/* Compliance Filter Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-3 items-center text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-bold font-sans">
                <Filter className="w-3.5 h-3.5 text-indigo-650" />
                Filter By Persona:
              </span>
              <select
                value={auditFilterUser}
                onChange={(e) => setAuditFilterUser(e.target.value)}
                className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Personas</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Branch Admin">Branch Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Staff">Staff</option>
                <option value="Patient">Patient</option>
              </select>
              {auditFilterUser !== 'All' && (
                <button
                  type="button"
                  onClick={() => setAuditFilterUser('All')}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto text-sm text-slate-705">
              <table className="w-full">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Audit Timestamp</th>
                    <th className="px-5 py-3 text-left font-semibold">Origin Persona Role</th>
                    <th className="px-5 py-3 text-left font-semibold">Operation Executed</th>
                    <th className="px-5 py-3 text-right font-semibold">Source IP Zone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-55/50 font-sans">
                      <td className="px-5 py-3 font-mono text-slate-450">{log.timestamp}</td>
                      <td className="px-5 py-3 font-bold text-slate-800 font-sans">{log.userType}</td>
                      <td className="px-5 py-3 font-sans italic text-slate-655 font-sans">"{log.action}"</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-450">{log.ip}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-xs font-sans">
                        No audit activities match the selected persona.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {activeTab === 'cloud' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {/* Backups Action */}
            <div className="bg-white border border-slate-250 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-wider bg-slate-900 text-teal-400 font-bold uppercase rounded inline-block">
                  AWS Clustered backups
                </span>
                <h2 className="text-base font-bold text-slate-850 font-sans">System Cloud database Snapshot</h2>
                <p className="text-xs text-slate-505 leading-relaxed font-sans">
                  Generates a point-in-time snapshot database state containing licensing counts, billing ledgers, medications lists, and telehealth queues. Compliant with HIPAA standards.
                </p>
              </div>

              <div className="pt-6 font-sans">
                <button
                  disabled={backupLoading}
                  onClick={handleBackupClick}
                  className="w-full bg-slate-900 border border-slate-850 text-teal-400 hover:bg-slate-800 font-extrabold font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${backupLoading ? 'animate-spin' : ''}`} />
                  {backupLoading ? 'EXECUTING Snapshot ARCHIVE...' : 'TRIGGER FULL SYSTEM SNAPSHOT DATA BACKUP'}
                </button>

                {backupSuccess && (
                  <div className="text-center font-bold text-xs text-emerald-650 mt-2 font-sans">
                    ✔ AWS S3 redundant snapshot synced and validated! Code: BACKUP-SHA56
                  </div>
                )}
              </div>
            </div>

            {/* Backup metadata statistics */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between font-sans">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-455 pb-2 border-b border-slate-205 font-mono">Archive Snapshot Specifications</h3>
                
                <div className="text-xs space-y-2.5 mt-4 text-slate-705">
                  <div className="flex justify-between">
                    <span>HIPAA Guidelines checked:</span>
                    <strong className="text-emerald-600 font-bold">PASSED ✔</strong>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span>S3 Sharding nodes count:</span>
                    <strong className="font-mono">3 Redundant Regions</strong>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span>Encryption level:</span>
                    <strong className="font-mono">AES-256 System-Locked</strong>
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono mt-4 block">
                Redundant copies: US-EAST-1, EU-WEST-1, AP-NORTHEAST-1
              </span>
            </div>
          </div>

        </div>
      )}
        </div>
      </div>

      {/* Hospital Provision Modal */}
      {showHospModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Provision New Hospital Node</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Launches a separate multi-tenant node, isolates database rows, and authorizes administrator licensing keys.</p>
            </div>

            <form onSubmit={handleHospSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Hospital Legal Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mount Sinai Wellness Care"
                  value={hospName}
                  onChange={(e) => setHospName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 focus:outline-hidden rounded-lg font-sans text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Tenant Code Key</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. MSW-CARE"
                    value={hospCode}
                    onChange={(e) => setHospCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-505 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1">Pricing Licensing Tier</label>
                  <select
                    value={hospTier}
                    onChange={(e) => setHospTier(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-indigo-500 rounded-lg font-medium text-slate-800"
                  >
                    <option value="Basic">Basic Tier Plan</option>
                    <option value="Standard">Standard Tier</option>
                    <option value="Enterprise">Enterprise License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-605 uppercase tracking-wider pb-1 font-mono">Contact Administrator Email</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. admin@gmail.com"
                  value={hospEmail}
                  onChange={(e) => setHospEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-550 focus:outline-hidden rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowHospModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-hospital-provision"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Provision Tenant Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Node Launcher Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Launch Branch Node location</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Registers a physical branch clinic under an outstanding tenant, maps default wards, and triggers bed registries.</p>
            </div>

            <form onSubmit={handleBranchSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-606 uppercase tracking-wider pb-1 font-sans">Align Parent Hospital</label>
                <select
                  required
                  value={branchHospId}
                  onChange={(e) => setBranchHospId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-355 focus:border-indigo-500 rounded-lg font-bold text-slate-850"
                >
                  <option value="">-- Choose Hospital Tenant --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name} (Code: {h.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Branch Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mount Sinai - Central Chicago"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 focus:outline-hidden rounded-lg font-sans text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Clinic City</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Chicago"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-500 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1 font-sans">Wards Bed capacity</label>
                  <input
                    required
                    type="number"
                    min={5}
                    value={branchBeds}
                    onChange={(e) => setBranchBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-350 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer animate-fade-in"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-branch-launcher"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Launch Clinic Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appoint Branch Admin RBAC Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-150 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Appoint Branch Admin</h3>
              <p className="text-xs text-slate-550 mt-0.5 font-sans">Authorizes a clinical administrative user under a child node and assigns RBAC permissions.</p>
            </div>

            <form onSubmit={handleAdminSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider pb-1">Align Target Branch</label>
                <select
                  required
                  value={adminBranchId}
                  onChange={(e) => setAdminBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-350 focus:border-indigo-500 rounded-lg font-bold text-slate-800"
                >
                  <option value="">-- Choose Branch Node --</option>
                  {branches.map(br => (
                    <option key={br.id} value={br.id}>{br.name} ({br.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Administrator Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Robert Carter"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-350 focus:border-indigo-505 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Primary Email Credentials</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. r.carter@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-355 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider pb-1">Select Policy Scopes</label>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto p-2 border border-slate-205 rounded-lg bg-slate-50 text-[11px] text-slate-750">
                  {['Billing Management', 'Bed Lifecycle Control', 'Staff Scheduling', 'Inventory Dispatch', 'Pathology Diagnostic Signing'].map(pScope => (
                    <label key={pScope} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={adminPerms.includes(pScope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdminPerms([...adminPerms, pScope]);
                          } else {
                            setAdminPerms(adminPerms.filter(p => p !== pScope));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{pScope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-admin-rbac"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
