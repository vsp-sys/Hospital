/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, Users, RefreshCw, Send, ShieldAlert, Heart, Calendar, 
  CreditCard, Clipboard, Database, ShieldCheck, Star, Sparkles, 
  Megaphone, X, Bed, Check, Activity, Award, Thermometer, LogOut, Menu, Lock, Sun, Moon,
  Bell, AlertTriangle, UserCheck, Trash2
} from 'lucide-react';

// Subcomponents
import SuperAdminPanel from './components/SuperAdminPanel';
import BranchAdminPanel from './components/BranchAdminPanel';
import StaffWorkspace from './components/StaffWorkspace';
import DoctorDashboard from './components/DoctorDashboard';
import PatientPortal from './components/PatientPortal';
import LoginPage from './components/LoginPage';
import SaasSubscriptionGate from './components/SaasSubscriptionGate';


// API client
import api from './api';

// Data Mock source
import {
  initialHospitals,
  initialBranches,
  initialBeds,
  initialDoctors,
  initialPatients,
  initialAppointments,
  initialPrescriptions,
  initialInvoices,
  initialLabOrders,
  initialHelpTickets,
  initialVitalLogs,
  initialFluidRecords,
  initialMARMedications,
  initialShiftHandoffs,
  initialEmergencyAlerts,
  initialAuditLogs,
  initialBranchAdmins,
  initialInventory,
  initialNotifications
} from './data';

export default function App() {
  // Global States
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [branches, setBranches] = useState(initialBranches);
  const [beds, setBeds] = useState(initialBeds);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffAdmins, setStaffAdmins] = useState([]);
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [labOrders, setLabOrders] = useState(initialLabOrders);
  const [tickets, setTickets] = useState(initialHelpTickets);
  const [vitals, setVitals] = useState(initialVitalLogs);
  const [fluids, setFluids] = useState(initialFluidRecords);
  const [medications, setMedications] = useState(initialMARMedications);
  const [handoffs, setHandoffs] = useState(initialShiftHandoffs);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [branchAdmins, setBranchAdmins] = useState(initialBranchAdmins);
  const [inventoryItems, setInventoryItems] = useState(initialInventory);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [licenses, setLicenses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  
  // Real-time Notification States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem('medcore-read-notifs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState([]);
  const [shownToastIds, setShownToastIds] = useState(new Set());
  const [appBootTime] = useState(() => Date.now());

  // Notification composer states
  const [compTitle, setCompTitle] = useState('');
  const [compMessage, setCompMsg] = useState('');
  const [compTarget, setCompTarget] = useState('all');
  const [compUrgency, setCompUrgency] = useState('Info');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [sendNotifErr, setSendNotifErr] = useState('');
  const [sendNotifSuccess, setSendNotifSuccess] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState('inbox');

  // Custom Global Metropage broadcaster banner
  const [globalBroadcast, setGlobalBroadcast] = useState(
    "📢 Live System broadcast: AWS Mainframe Backup state validated successfully. HIPAA guidelines complied."
  );

  // Authentication Guard State
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInRole, setLoggedInRole] = useState(null);
  const [targetRoleForLogin, setTargetRoleForLogin] = useState(null);

  // Theme Toggle State (Light / Dark Mode)
  const [theme, setTheme] = useState(() => localStorage.getItem('medcore-theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medcore-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Active User Persona selector
  const [activePersona, setActivePersona] = useState('super_admin');

  // Mobile sidebar drawer state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);


  // On mount, check for existing login token and fetch user if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally, verify token with backend or decode
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setIsLoggedIn(true);
        setLoggedInUser(user);
        setLoggedInRole(user.role);
      }
    }
  }, []);

  // On boot: check autoseed and set up active onSnapshot subscriptions to synchronize dynamic state in real-time
  useEffect(() => {
    const initialLicenses = [
      { id: 'lic-enterprise', name: 'Enterprise Licensing tier', description: 'Includes active redundant backup', price: 1200, duration: 'month' },
      { id: 'lic-standard', name: 'Standard Tier License', description: 'EHR prescriptions limit: Unlimited', price: 450, duration: 'month' }
    ];

    // Only load data if user is authenticated
    if (!isLoggedIn) {
      return;
    }

    async function loadData() {
      try {
        const [hospRes, branchRes, bedRes, docRes, patRes, apptRes, prescRes, invRes, ticketRes, fluidsRes, handoffsRes, branchAdminsRes, inventoryRes, auditLogsRes, notificationsRes, usersRes, staffRes, staffAdminsRes] = await Promise.all([
          api.get('/hospitals'),
          api.get('/branches'),
          api.get('/beds'),
          api.get('/doctors'),
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/prescriptions'),
          api.get('/invoices'),
          api.get('/tickets'),
          api.get('/fluids'),
          api.get('/handoffs'),
          api.get('/branchAdmins'),
          api.get('/inventory'),
          api.get('/auditLogs'),
          api.get('/notifications'),
          api.get('/users'),
          api.get('/staff'),
          api.get('/staffAdmins'),
        ]);
        setHospitals(hospRes.data);
        setBranches(branchRes.data);
        setBeds(bedRes.data);
        setDoctors(docRes.data);
        setPatients(patRes.data);
        setAppointments(apptRes.data);
        setPrescriptions(prescRes.data);
        setInvoices(invRes.data);
        setTickets(ticketRes.data);
        setFluids(fluidsRes.data);
        setHandoffs(handoffsRes.data);
        setBranchAdmins(branchAdminsRes.data.map(a => ({ ...a, id: a._id || a.id })));
        setInventoryItems(inventoryRes.data);
        setAuditLogs(auditLogsRes.data);
        setNotifications(notificationsRes.data);
        // Staff / users
        setStaffMembers(staffRes.data || []);
        setStaffAdmins(staffAdminsRes.data || []);

        // Merge any user-only doctors into doctors list (fallback)
        try {
          const userDocs = usersRes.data || [];
          const extraDoctors = userDocs.filter(u => u.role === 'doctor').map(u => ({
            _id: u._id || u.id,
            userId: u._id || u.id,
            name: u.name,
            specialty: u.specialty || '',
            contact: u.contact || u.email,
            availability: 'On Duty',
            branchId: (branchRes.data && branchRes.data[0] && (branchRes.data[0]._id || branchRes.data[0].id)) || 'br-1'
          }));
          // Combine and dedupe by _id/email
          const combined = [...docRes.data, ...extraDoctors];
          const seen = new Set();
          const deduped = combined.filter(d => {
            const key = d._id || d.email || d.userId || d.name;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setDoctors(deduped);
        } catch (e) {
          setDoctors(docRes.data || []);
        }
        setLicenses(initialLicenses);
      } catch (err) {
        console.warn('Failed to fetch data:', err.message);
        // Keep using mock data if API fails
      }
    }

    loadData();
  }, [isLoggedIn]);

  // Keep read notifications synchronized with localStorage
  useEffect(() => {
    localStorage.setItem('medcore-read-notifs', JSON.stringify(readNotifIds));
  }, [readNotifIds]);

  // Trigger real-time visual popup toasts for new incoming medical alerts relevant to persona
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    notifications.forEach(notif => {
      const isForMe = notif.targetRole === 'all' || notif.targetRole === activePersona;
      const notifTime = new Date(notif.timestamp).getTime();
      
      // Filter alerts created after application booted
      const isNew = notifTime > (appBootTime - 5000); 
      const alreadyShown = shownToastIds.has(notif.id);

      if (isForMe && isNew && !alreadyShown) {
        setShownToastIds(prev => {
          const updated = new Set(prev);
          updated.add(notif.id);
          return updated;
        });

        // Add to toast queue
        setToasts(prev => [...prev, notif]);

        // Automatically dismiss toast popup after 6 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== notif.id));
        }, 6000);
      }
    });
  }, [notifications, activePersona]);

  const markAllNotificationsAsRead = () => {
    const relevantNotifs = notifications.filter(
      n => n.targetRole === 'all' || n.targetRole === activePersona
    );
    const relevantIds = relevantNotifs.map(n => n.id);
    setReadNotifIds(prev => Array.from(new Set([...prev, ...relevantIds])));
  };

  // Triggering helpers
  // Append audit log using backend API
  const appendAuditLog = async (userType, action) => {
    const freshLog = {
      timestamp: new Date().toISOString(),
      userType,
      action,
      ip: '192.168.2.' + Math.floor(Math.random() * 254)
    };
    try {
      await api.post('/auditLogs', freshLog);
      // Optionally update local state
      setAuditLogs(prev => [...prev, freshLog]);
    } catch (err) {
      console.warn('Failed to append audit log:', err.message);
    }
  };

  // Example login function
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsLoggedIn(true);
      setLoggedInUser(res.data.user);
      setLoggedInRole(res.data.user.role);
      return true;
    } catch (err) {
      setIsLoggedIn(false);
      setLoggedInUser(null);
      setLoggedInRole(null);
      return false;
    }
  };

  // Example logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setLoggedInRole(null);
  };

  // SYNC FUNCTIONS - API wrappers for database operations
  const addHospitalSync = async (hospital) => {
    try {
      const res = await api.post('/hospitals', hospital);
      setHospitals(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to add hospital:', err.message);
      return null;
    }
  };

  const toggleHospitalStateSync = async (hospId, currentState) => {
    try {
      const newState = !currentState;
      const res = await api.put(`/hospitals/${hospId}`, { isActive: newState });
      setHospitals(prev => prev.map(h => h.id === hospId ? res.data : h));
      return res.data;
    } catch (err) {
      console.error('Failed to toggle hospital state:', err.message);
    }
  };

  const addBranchSync = async (branch) => {
    try {
      const res = await api.post('/branches', branch);
      setBranches(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to add branch:', err.message);
      return null;
    }
  };

  const addBranchAdminSync = async (admin) => {
    try {
      const res = await api.post('/branchAdmins', admin);
      const data = { ...res.data, id: res.data._id || res.data.id };
      setBranchAdmins(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to add branch admin:', err.message);
      return null;
    }
  };

  const addNotificationSync = async (notif) => {
    try {
      const res = await api.post('/notifications', notif);
      setNotifications(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to add notification:', err.message);
      return null;
    }
  };

  const deleteNotificationSync = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      return true;
    } catch (err) {
      console.error('Failed to delete notification:', err.message);
      return false;
    }
  };

  const toggleBranchAdminStatusSync = async (adminId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const res = await api.put(`/branchAdmins/${adminId}`, { status: newStatus });
      const data = { ...res.data, id: res.data._id || res.data.id };
      setBranchAdmins(prev => prev.map(a => a.id === adminId ? data : a));
      return data;
    } catch (err) {
      console.error('Failed to toggle admin status:', err.message);
    }
  };

  const deleteBranchAdminSync = async (adminId) => {
    try {
      await api.delete(`/branchAdmins/${adminId}`);
      setBranchAdmins(prev => prev.filter(a => a.id !== adminId));
      return true;
    } catch (err) {
      console.error('Failed to delete branch admin:', err.message);
    }
  };

  const addPatientSync = async (patient) => {
    try {
      const res = await api.post('/patients', patient);
      setPatients(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to add patient:', err.message);
      return null;
    }
  };

  const dischargePatientSync = async (patientId) => {
    try {
      const res = await api.put(`/patients/${patientId}`, { status: 'Discharged' });
      setPatients(prev => prev.map(p => p.id === patientId ? res.data : p));
      return res.data;
    } catch (err) {
      console.error('Failed to discharge patient:', err.message);
    }
  };

  const updateBedStatusSync = async (bedId, status, patientId, patientName) => {
    try {
      const res = await api.put(`/beds/${bedId}`, { status, patientId, patientName });
      setBeds(prev => prev.map(b => b.id === bedId ? res.data : b));
      return res.data;
    } catch (err) {
      console.error('Failed to update bed status:', err.message);
    }
  };

  const setBedTimerSync = async (bedId, duration, endsAt) => {
    try {
      const res = await api.put(`/beds/${bedId}`, { timerDuration: duration, timerEndsAt: endsAt });
      setBeds(prev => prev.map(b => b.id === bedId ? res.data : b));
      return res.data;
    } catch (err) {
      console.error('Failed to set bed timer:', err.message);
    }
  };

  const addBedSync = async (bed) => {
    try {
      const res = await api.post('/beds', bed);
      setBeds(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to add bed:', err.message);
      return null;
    }
  };

  const resolveTicketSync = async (ticketId) => {
    try {
      const res = await api.put(`/tickets/${ticketId}`, { status: 'Resolved' });
      setTickets(prev => prev.map(t => t.id === ticketId ? res.data : t));
      return res.data;
    } catch (err) {
      console.error('Failed to resolve ticket:', err.message);
    }
  };

  const wipeAllCollectionsSync = async () => {
    try {
      await api.post('/wipeAll');
      setHospitals([]);
      setBranches([]);
      setBeds([]);
      setDoctors([]);
      setPatients([]);
      setAppointments([]);
      setPrescriptions([]);
      setInvoices([]);
      setLabOrders([]);
      setTickets([]);
      setFluids([]);
      setHandoffs([]);
      setEmergencyAlert(null);
      setAuditLogs([]);
      setBranchAdmins([]);
      setInventoryItems([]);
      setNotifications([]);
      return true;
    } catch (err) {
      console.error('Failed to wipe collections:', err.message);
    }
  };

  const restockMedicineSync = async (itemId, currentQty, amount) => {
    try {
      const res = await api.put(`/inventory/${itemId}`, { quantity: currentQty + amount });
      setInventoryItems(prev => prev.map(i => i.id === itemId ? res.data : i));
      return res.data;
    } catch (err) {
      console.error('Failed to restock medicine:', err.message);
    }
  };

  const dispensePharmacySync = async (itemId, currentQty, amount) => {
    try {
      const res = await api.put(`/inventory/${itemId}`, { quantity: Math.max(0, currentQty - amount) });
      setInventoryItems(prev => prev.map(i => i.id === itemId ? res.data : i));
      return res.data;
    } catch (err) {
      console.error('Failed to dispense medicine:', err.message);
    }
  };

  const updateLabStatusSync = async (labId, status, result) => {
    try {
      const res = await api.put(`/laborders/${labId}`, { status, result });
      setLabOrders(prev => prev.map(l => l.id === labId ? res.data : l));
      return res.data;
    } catch (err) {
      console.error('Failed to update lab status:', err.message);
    }
  };

  const addDoctorSync = async (doctor) => {
    try {
      const res = await api.post('/doctors', doctor);
      setDoctors(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to add doctor:', err.response?.data || err.message);
      return null;
    }
  };

  // 1. SUPER ADMIN PIPELINES
  const handleAddHospital = (newHosp) => {
    addHospitalSync(newHosp).then((created) => {
      if (created) {
        appendAuditLog('Super Admin', `Provisioned new Hospital Tenant Node: ${created.name}`);
      }
    });
  };

  const handleToggleHospitalState = (hospId) => {
    const target = hospitals.find(h => h.id === hospId);
    if (target) {
      toggleHospitalStateSync(hospId, target.isActive).then(() => {
        appendAuditLog('Super Admin', `Set Hospital subscription block for ${target.name} to ${!target.isActive ? 'ACTIVE' : 'BLOCKED'}`);
      });
    }
  };

  const handleAddBranch = (newBranch) => {
    const hosp = hospitals.find(h => h.id === newBranch.hospitalId);
    const count = hosp ? hosp.branchesCount : 0;
    addBranchSync({ ...newBranch, branchesCount: count }).then((created) => {
      if (created) {
        appendAuditLog('Super Admin', `Launched Clinic Branch: ${created.name} (${created.city})`);
      }
    });
  };

  const handleResolveTicket = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      resolveTicketSync(ticketId).then(() => {
        appendAuditLog('Super Admin', `Resolved Help Desk Technical request: ${ticket.subject}`);
      });
    }
  };
  const handleGlobalBroadcast = (message) => {
    setGlobalBroadcast(`📢 Live System broadcast: ${message}`);
    appendAuditLog('Super Admin', `Dispatched multi-tenant pager notification: "${message}"`);
    
    // Create a real notification so it pops up in the alert box
    const notif = {
      title: 'Global Broadcast',
      message: message,
      targetRole: 'all',
      urgency: 'Urgent',
      senderName: 'System Administrator',
      senderRole: 'Super Admin',
      timestamp: new Date().toISOString(),
      read: false
    };
    addNotificationSync(notif);
  };

  const handleSystemBackup = () => {
    appendAuditLog('Super Admin', 'Signed cryptographic system AWS backup snapshots archive.');
  };

  const handleWipeDatabase = async () => {
    // Clear all state variables locally
    setHospitals([]);
    setBranches([]);
    setBeds([]);
    setDoctors([]);
    setPatients([]);
    setAppointments([]);
    setPrescriptions([]);
    setInvoices([]);
    setLabOrders([]);
    setTickets([]);
    setVitals([]);
    setFluids([]);
    setMedications([]);
    setHandoffs([]);
    setAuditLogs([]);
    setBranchAdmins([]);
    setInventoryItems([]);
    setNotifications([]);

    try {
      await wipeAllCollectionsSync();
    } catch (err) {
      console.warn("Wiping Firestore collections failed:", err.message);
    }

    appendAuditLog('Super Admin', 'Completed full system-wide database wipeout. Initiated clean database baseline state.');
  };

  const handleAddBranchAdmin = (newAdmin) => {
    addBranchAdminSync(newAdmin).then((created) => {
      if (created) {
        appendAuditLog('Super Admin', `Registered Privileged Identity - Branch Admin: ${created.name} allocated to ${created.branchName}`);
      }
    });
  };

  const handleToggleBranchAdminStatus = (adminId) => {
    const target = branchAdmins.find(adm => adm.id === adminId);
    if (target) {
      toggleBranchAdminStatusSync(adminId, target.status).then((updated) => {
        if (updated) {
          const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
          setBranchAdmins(prev => prev.map(adm => adm.id === adminId ? { ...adm, status: nextStatus } : adm));
          appendAuditLog('Super Admin', `Toggled Admin Status of ${target.name} to ${nextStatus.toUpperCase()}`);
        }
      });
    }
  };

  const handleDeleteBranchAdmin = (adminId) => {
    const target = branchAdmins.find(adm => adm.id === adminId);
    if (target) {
      deleteBranchAdminSync(adminId).then(() => {
        setBranchAdmins(prev => prev.filter(adm => adm.id !== adminId));
        appendAuditLog('Super Admin', `Permanently deleted Branch Admin account or request for: ${target.name}`);
      });
    }
  };

  const handleDischargePatient = (patientId) => {
    dischargePatientSync(patientId).then(() => {
      const p = patients.find(p => p.id === patientId);
      if (p) {
        appendAuditLog('Branch Admin', `Discharged Inpatient case file: ${p.name}`);
      }
    });
    // De-allocate any bed occupied by this patient in Firestore
    beds.forEach(b => {
      if (b.patientId === patientId) {
        updateBedStatusSync(b.id, 'Unoccupied', null, null).then(() => {
          appendAuditLog('Branch Admin', `Released Bed ${b.bedNumber} - Clean-up Sanitation Cycle Triggered`);
        });
      }
    });
  };

  const handleRestockMedicine = (itemId, amount) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      restockMedicineSync(itemId, item.quantity, amount).then(() => {
        appendAuditLog('Branch Admin', `Restocked Pharmacy Drug Inventory - ${item.name} (+${amount} ${item.unit})`);
      });
    }
  };

  const handleDispensePharmacy = (itemId, amount) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (item) {
      dispensePharmacySync(itemId, item.quantity, amount).then(() => {
        appendAuditLog('Staff Nurse', `Dispensed prescription drugs from pharmacy: ${item.name} (-${amount} ${item.unit})`);
      });
    }
  };

  const handleUpdateLabStatus = (labId, status, result) => {
    updateLabStatusSync(labId, status, result).then(() => {
      const order = labOrders.find(l => l.id === labId);
      if (order) {
        appendAuditLog('Staff Lab Worker', `Completed Lab Assay #${labId} (${order.testName}): "${result || 'Results Compiled'}"`);
      }
    });
  };

  // 2. BRANCH ADMIN PIPELINES
  // Fix: Remove Firebase logic, only use API and local state
  const handleAddDoctor = (newDoc) => {
    // Ensure branchId is correct MongoDB ObjectId or fallback to branch id
    const branch = branches.find(b => b.id === newDoc.branchId || b._id === newDoc.branchId);
    const docPayload = {
      ...newDoc,
      branchId: branch?._id || branch?.id || newDoc.branchId
    };
    addDoctorSync(docPayload).then((created) => {
      if (created) {
        // Determine returned role: doctor responses are doctor documents; non-doctor responses return { user }
        const returnedRole = created.role || created.user?.role || (created.userId ? 'doctor' : undefined);
        if (returnedRole && returnedRole !== 'doctor') {
          // Non-doctor: only a User was created, do not add to doctors list
          appendAuditLog('Branch Admin', `Created user: ${created.user?.name || created.name} with role ${returnedRole}`);
        } else {
          // Doctor: append to doctors list
          setDoctors(prev => {
            const createdId = created._id || created.id;
            if (prev.some(d => d._id === createdId || d.id === createdId)) return prev;
            return [...prev, created];
          });
          appendAuditLog('Branch Admin', `Enrolled specialty Doctor: ${created.name} (${created.specialty})`);
        }
      }
    });
  };

  // Fix: Remove Firebase logic, only use API and local state
  const handleAddPatient = (newPat) => {
    // Ensure branchId is correct MongoDB ObjectId
    const branch = branches.find(b => b.id === newPat.branchId || b._id === newPat.branchId) || branches.find(b => b.id === activeBranchId || b._id === activeBranchId);
    const created = {
      ...newPat,
      id: `pat-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0],
      branchId: branch?._id || newPat.branchId
    };
    addPatientSync(created).then((saved) => {
      if (saved) {
        appendAuditLog('Branch Admin', `Admitted Inpatient health case: ${created.name}`);
      }
    });
  };

  const handleAddBed = (newBed) => {
    // Ensure branchId is correct MongoDB ObjectId
    const branch = branches.find(b => b.id === activeBranchId || b._id === activeBranchId);
    const created = {
      id: `bed-${Date.now()}`,
      branchId: branch?._id || activeBranchId,
      timerDuration: null,
      timerEndsAt: null,
      patientId: null,
      patientName: null,
      ...newBed
    };
    addBedSync(created).then(() => {
      setBeds(prev => {
        if (prev.some(b => b.id === created.id)) return prev;
        return [...prev, created];
      });
      appendAuditLog('Branch Admin', `Configured dynamic bed: ${created.bedNumber} in ${created.wardName}`);
    });
  };

  // Background interval to check for bed release timer expiration
  useEffect(() => {
    const interval = setInterval(() => {
      beds.forEach(b => {
        if (b.timerEndsAt && Date.now() >= b.timerEndsAt && b.status !== 'Unoccupied') {
          updateBedStatusSync(b.id, 'Unoccupied', null, null).then(() => {
            appendAuditLog('Automatic Bed System', `Release timer expired for ${b.bedNumber}. Status set to Unoccupied (Blue).`);
          });
        }
      });
    }, 5000); // 5 seconds interval to avoid Firestore write flooding
    return () => clearInterval(interval);
  }, [beds]);

  const handleSetBedTimer = (bedId, duration) => {
    let durationMs = 0;
    if (duration === '3_days') durationMs = 3 * 24 * 60 * 60 * 1000;
    else if (duration === '5_days') durationMs = 5 * 24 * 60 * 60 * 1000;
    else if (duration === '1_week') durationMs = 7 * 24 * 60 * 60 * 1000;
    else if (duration === '1_minute') durationMs = 60 * 1000;
    else if (duration === '10_seconds') durationMs = 10 * 1000;

    const b = beds.find(x => x.id === bedId);
    if (b) {
      if (!duration) {
        setBedTimerSync(bedId, null, null).then(() => {
          appendAuditLog('Branch Admin', `Removed release timer on bed ${b.bedNumber}`);
        });
      } else {
        const endsAt = Date.now() + durationMs;
        setBedTimerSync(bedId, duration, endsAt).then(() => {
          appendAuditLog('Branch Admin', `Set release timer on bed ${b.bedNumber} of ${duration.replace('_', ' ')}`);
        });
      }
    }
  };

  const handleExpireBedTimer = (bedId) => {
    const b = beds.find(x => x.id === bedId);
    if (b) {
      updateBedStatusSync(bedId, 'Unoccupied', null, null).then(() => {
        appendAuditLog('Branch Admin', `Manual trigger: expired release timer on bed ${b.bedNumber}`);
      });
    }
  };

  const handleUpdateBedStatus = (bedId, status, patientId, patientName) => {
    updateBedStatusSync(bedId, status, patientId, patientName).then(() => {
      const b = beds.find(x => x.id === bedId);
      if (b) {
        appendAuditLog('Branch Admin', `Allocated Bed ${b.bedNumber} status mode: ${status}`);
      }
    });
  };

  const handleAddInvoice = (patientId, patientName, description, cost) => {
    const created = {
      id: `inv-${Date.now()}`,
      patientId,
      patientName,
      branchId: 'br-1',
      date: new Date().toISOString().split('T')[0],
      totalAmount: cost,
      status: 'Unpaid',
      services: [{ description, cost }]
    };
    addInvoiceSync(created).then(() => {
      appendAuditLog('Branch Admin', `Generated client Ledger Invoice for ${patientName}: $${cost}`);
    });
  };

  const handleReconcileInvoice = (invoiceId, status) => {
    reconcileInvoiceSync(invoiceId, status).then(() => {
      appendAuditLog('Branch Admin', `Reconciled Invoice #${invoiceId} payment state to ${status}`);
    });
  };

  // 3. STAFF / NURSING PIPELINES
  const handleLogVitals = (vData) => {
    let bClass = 'Stable';
    if (vData.heartRate < 50 || vData.heartRate > 115 || vData.spO2 < 92) {
      bClass = 'Critical';
    } else if (vData.heartRate > 100 || vData.temperature > 100.5) {
      bClass = 'Warning';
    }

    logVitalsSync(vData, bClass).then(() => {
      appendAuditLog('Staff Nurse', `Logged bed telemetry values for ${vData.patientName}: Result Triage as ${bClass}`);
    });
  };

  const handleLogFluid = (fData) => {
    logFluidSync(fData).then(() => {
      appendAuditLog('Staff Nurse', `Logged hydration fluid balance charting for ${fData.patientName}`);
    });
  };

  const handleToggleMedState = (medId) => {
    const med = medications.find(m => m.id === medId);
    if (med) {
      const nextStatus = med.status === 'Administered' ? 'Scheduled' : 'Administered';
      const timeSign = nextStatus === 'Administered' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
      toggleMedStateSync(medId, nextStatus, timeSign).then(() => {
        appendAuditLog('Staff Nurse', `Adjusted Medication checklist status for ${med.medicineName} to ${nextStatus}`);
      });
    }
  };

  const handleAddHandoff = (notes, criticalAlerts) => {
    const created = {
      id: `hd-${Date.now()}`,
      branchId: 'br-1',
      date: new Date().toISOString().split('T')[0],
      outgoingStaff: 'Nurse Sarah Jenkins, RN',
      incomingStaff: 'Nurse Keith Carter, LPN',
      notes,
      criticalAlerts
    };
    addHandoffSync(created).then(() => {
      appendAuditLog('Staff Nurse', 'Committed clinical Shift Continuity handoff notes.');
    });
  };

  const handleTriggerEmergency = (code, location) => {
    const created = {
      id: `eme-${Date.now()}`,
      branchId: 'br-1',
      code,
      location,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true
    };
    setEmergencyAlert(created);
    appendAuditLog('Staff Nurse', `🚨 SYSTEM WARNING: CODE ${code.toUpperCase()} OUTBREAK SPOTTED AT ${location}`);
  };

  const handleResolveEmergency = () => {
    if (emergencyAlert) {
      appendAuditLog('Staff Nurse', `✔ Standing down system crisis Code ${emergencyAlert.code} at ${emergencyAlert.location}`);
    }
    setEmergencyAlert(null);
  };

  // 4. DOCTORS CLINICAL PIPELINES
  const handleAddPrescription = (newPresc) => {
    addPrescriptionSync(newPresc).then(() => {
      appendAuditLog(newPresc.doctorName, `Authored electronic Prescription for patient: ${newPresc.patientName}`);
    });
  };

  const handleUpdateAppointmentStatus = (aptId, status) => {
    updateAppointmentStatusSync(aptId, status).then(() => {
      const apt = appointments.find(a => a.id === aptId);
      if (apt) {
        if (status === 'Completed') {
          // Add $150 premium consult earnings to the consultant doctor
          const d = doctors.find(docItem => docItem.id === apt.doctorId);
          if (d) {
            updateDoc(doc(db, 'doctors', d.id), { earnings: d.earnings + 150 });
          }
        }
        appendAuditLog(apt.doctorName, `Set Consult Slot appointment with ${apt.patientName} to ${status}`);
      }
    });
  };

  // 5. PATIENT PORTAL PIPELINES
  const handleBookAppointment = (newApt) => {
    bookAppointmentSync(newApt).then(() => {
      appendAuditLog('Patient Portal', `${newApt.patientName} scheduled electronic consult with ${newApt.doctorName}`);
    });
  };

  const handlePayInvoice = (invoiceId) => {
    reconcileInvoiceSync(invoiceId, 'Paid').then(() => {
      const inv = invoices.find(i => i.id === invoiceId);
      if (inv) {
        appendAuditLog('Patient Portal', `${inv.patientName} cleared outstanding Invoice balance #${invoiceId} ($${inv.totalAmount})`);
      }
    });
  };

  const handleDeleteNotification = (notifId) => {
    deleteNotificationSync(notifId).then(() => {
      const currentRole = getProfileInfo()?.role || 'User';
      appendAuditLog(currentRole, `Deleted system communication notification node ID: ${notifId}`);
    }).catch((err) => {
      console.error("Failed to delete notification index:", err);
    });
  };

  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true);
    setActivePersona(role);
    setLoggedInRole(role);
    
    let roleTitle = 'System user';
    if (role === 'super_admin') roleTitle = 'Super Admin';
    else if (role === 'branch_admin') roleTitle = 'Branch Admin';
    else if (role === 'staff_admin') roleTitle = 'Staff Admin';
    else if (role === 'staff') roleTitle = 'Nursing Staff';
    else if (role === 'doctor') roleTitle = 'Consulting Physician';
    else if (role === 'patient') roleTitle = 'Patient Portal';

    appendAuditLog(
      roleTitle, 
      `Authorized session connection established via MedCore Gateway. Target Role: ${role}`
    );
  };

  const getProfileInfo = () => {
    switch (activePersona) {
      case 'super_admin':
        return {
          name: 'Super System Admin',
          role: 'Global Tenant Authority',
          badge: 'Level 5 Clearance',
          avatar: 'SU'
        };
      case 'branch_admin': {
        // Fix: match branch admin by email, not adminId
        const customAdmin = loggedInUser?.role === 'branch_admin' ? branchAdmins.find(a => a.email === loggedInUser.email) : null;
        return {
          name: customAdmin ? customAdmin.name : 'Mayo Operations Mgr',
          role: customAdmin ? `Admin - ${customAdmin.branchName}` : 'Branch Operations Admin',
          badge: 'Level 4 Clearance',
          avatar: customAdmin ? customAdmin.name.substring(0, 2).toUpperCase() : 'BM'
        };
      }
      case 'staff':
        return {
          name: 'Sarah Jenkins, RN',
          role: 'Clinical Nurse Lead',
          badge: 'Level 3 Access',
          avatar: 'SJ'
        };
      case 'staff_admin':
        return {
          name: loggedInUser?.name || 'Dr. Jane Vance',
          role: 'Chief Nursing Officer & Staff Admin',
          badge: 'Level 4 Operational Authority',
          avatar: 'JV'
        };
      case 'doctor':
        return {
          name: 'Dr. Gregory House',
          role: 'Diagnostic Consultant',
          badge: 'Level 4 Access',
          avatar: 'GH'
        };
      case 'patient': {
        const customPatient = loggedInUser?.role === 'patient' ? patients.find(p => p.id === loggedInUser.patientId) : null;
        return {
          name: customPatient ? customPatient.name : 'Douglas Parker',
          role: customPatient ? `Patient - Blood: ${customPatient.bloodGroup}` : 'Register Outpatient',
          badge: 'Civil Care Key',
          avatar: customPatient ? customPatient.name.substring(0, 2).toUpperCase() : 'DP'
        };
      }
      default:
        return {
          name: 'MedCore Practitioner',
          role: 'Clinical Node Node',
          badge: 'Verified User',
          avatar: 'MC'
        };
    }
  };

  const sidebarLinks = [
    { id: 'super_admin', label: 'Super Admin Portal', desc: 'SaaS licensing & tenants', icon: ShieldCheck, color: 'text-indigo-400' },
    { id: 'branch_admin', label: 'Branch Operations', desc: 'Department & budget ops', icon: Building, color: 'text-emerald-400' },
    { id: 'staff_admin', label: 'Staff Admin Portal', desc: 'Staff rosters & schedules', icon: UserCheck, color: 'text-blue-400' },
    { id: 'staff', label: 'Clinical Nursing Staff', desc: 'Ward telemetry & vitals', icon: Activity, color: 'text-sky-400' },
    { id: 'doctor', label: 'Practitioner Workstation', desc: 'Diagnostic EHR & orders', icon: Heart, color: 'text-teal-400' },
    { id: 'patient', label: 'Patient & Family Portal', desc: 'Schedules & health logs', icon: Users, color: 'text-rose-400' },
  ];

  const profile = getProfileInfo();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <LoginPage 
          initialRole={targetRoleForLogin}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginSuccess={(role, userDetails, needsSubscription) => {
            setIsLoggedIn(true);
            setActivePersona(role);
            setLoggedInRole(role);
            if (userDetails) {
              setLoggedInUser(userDetails);
              // Store token and user in localStorage
              if (userDetails.token) {
                localStorage.setItem('token', userDetails.token);
              }
              localStorage.setItem('user', JSON.stringify(userDetails));
            } else {
              setLoggedInUser(null);
            }
            
            // Show subscription gate for branch admins who need subscription
            if (needsSubscription) {
              setShowSubscriptionGate(true);
            }
            
            let roleTitle = 'System user';
            if (role === 'super_admin') roleTitle = 'Super Admin';
            else if (role === 'branch_admin') roleTitle = 'Branch Admin';
            else if (role === 'staff') roleTitle = 'Nursing Staff';
            else if (role === 'doctor') roleTitle = 'Consulting Physician';
            else if (role === 'patient') roleTitle = 'Patient Portal';

            appendAuditLog(
              roleTitle, 
              `Authorized session connection established via MedCore Gateway. Target Role: ${role}`
            );
          }}
          branchAdmins={branchAdmins}
          branches={branches}
          patients={patients}
          doctors={doctors}
          onRegisterBranchAdmin={(adminData) => {
            const newAdmin = {
              ...adminData,
              status: 'Pending',
              permissions: ['Billing Management', 'Bed Lifecycle Control', 'Staff Scheduling']
            };
            addBranchAdminSync(newAdmin).then((savedAdmin) => {
              if (savedAdmin) {
                appendAuditLog('Registration Desk', `Transmitted new Branch Admin registration request: ${newAdmin.name} assigned to ${newAdmin.branchName}`);
                
                // Forward notification to Super Admin
                const notifPayload = {
                  senderId: 'system',
                  senderName: 'System Automated Workflow',
                  senderRole: 'Registration Desk',
                  title: 'Pending Branch Admin Registration',
                  message: `New registration request from ${newAdmin.name} for branch: ${newAdmin.branchName}. Please review and authorize in the RBAC panel.`,
                  urgency: 'Warning',
                  targetRole: 'super_admin',
                  timestamp: new Date().toISOString()
                };
                addNotificationSync(notifPayload);
              }
            });
            return newAdmin;
          }}
          onRegisterPatient={(patientData) => {
            const newPatient = {
              ...patientData,
              id: `pat-${Date.now()}`,
              registeredDate: new Date().toISOString().split('T')[0],
              status: 'Outpatient'
            };
            addPatientSync(newPatient).then(() => {
              appendAuditLog('Registration Desk', `Registered new Patient profile via secure portal: ${newPatient.name} (${newPatient.email})`);
            });
            return newPatient;
          }}
        />
      </div>
    );
  }

  const activeBranchId = (loggedInUser?.role === 'branch_admin' && loggedInUser.branchId) || 'br-1';
  const activeBranch = branches.find(b => b.id === activeBranchId || b._id === activeBranchId) || branches[0] || { id: 'br-1', name: 'Temporary Clinic Branch', city: '', hospitalId: 'hosp-1' };
  const activeHospital = hospitals.find(h => h.id === activeBranch?.hospitalId) || hospitals[0] || { id: 'hosp-1', name: 'MedCore Health Network' };
  const currentBranchAdmin = loggedInUser?.role === 'branch_admin' ? branchAdmins.find(adm => adm.id === loggedInUser.adminId) : null;
  const activeHospitalName = (currentBranchAdmin && currentBranchAdmin.hospitalName) || activeHospital?.name || 'Mayo General Health Group';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      {/* SUBSCRIPTION GATE OVERLAY - Shows for branch admins who need subscription */}
      {showSubscriptionGate && (
        <SaasSubscriptionGate
          licenses={licenses}
          branchAdminName={loggedInUser?.name || 'Branch Administrator'}
          branchName={activeBranch?.name || 'Branch'}
          hospitalName={activeHospitalName}
          userId={loggedInUser?.id}
          token={localStorage.getItem('token')}
          onSubscriptionApproved={(plan) => {
            // Update user subscription status
            setLoggedInUser(prev => ({
              ...prev,
              subscriptionActive: true,
              subscriptionPlan: plan.name
            }));
            // Hide subscription gate
            setShowSubscriptionGate(false);
            appendAuditLog('Branch Admin', `Subscription activated: ${plan.name}`);
          }}
        />
      )}

      {/* SYSTEM BROADCAST FLOATING OVERLAY NOTIFICATION */}
      {globalBroadcast && (
        <div className="bg-slate-900 border-b border-slate-800 text-teal-350 px-4 py-2 text-xs font-mono font-medium flex items-center justify-between shadow-xs relative z-50">
          <div className="flex items-center gap-2 truncate">
            <Megaphone className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="truncate">{globalBroadcast}</span>
          </div>
          <button 
            onClick={() => setGlobalBroadcast(null)}
            className="text-slate-400 hover:text-white focus:outline-hidden transition-colors cursor-pointer ml-3 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MOBILE RESPONSIVE TOP HEADER */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 text-white py-3.5 px-4 flex items-center justify-between sticky top-0 z-45 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-indigo-600 rounded-lg text-white block shrink-0 shadow-sm">
            <Building className="w-4 h-4" />
          </span>
          <div>
            <h1 className="text-xs font-black tracking-tight text-white leading-tight">MedCore Healthcare</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Healthcare Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-row shrink-0">
          <button
            onClick={() => {
              setIsNotificationOpen(true);
              markAllNotificationsAsRead();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg cursor-pointer transition-colors text-slate-300 hover:text-white flex items-center justify-center relative"
            aria-label="System Notifications Center"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-[8px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length}
              </span>
            )}
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg cursor-pointer transition-colors text-slate-300 hover:text-white flex items-center justify-center"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg cursor-pointer transition-colors text-slate-300 hover:text-white"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-48 md:hidden bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200">
          <div className="w-64 bg-slate-900 border-r border-slate-850 h-full flex flex-col justify-between absolute left-0 top-0 text-slate-100 shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
                  <Building className="w-4 h-4" />
                </span>
                <div>
                  <h1 className="text-xs font-black tracking-tight leading-tight">MedCore Healthcare</h1>
                  <span className="text-[9px] text-slate-405 block tracking-wide font-bold">Mayo Gen Clinic</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="text-slate-455 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto w-full">
              <span className="block px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                WORKSTATION MODULES
              </span>
              {sidebarLinks.map(link => {
                const LinkIcon = link.icon;
                const isSelected = activePersona === link.id;
                const isLocked = link.id !== loggedInRole;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActivePersona(link.id);
                      } else {
                        setIsLoggedIn(false);
                        setLoggedInUser(null);
                        setLoggedInRole(null);
                        setTargetRoleForLogin(link.id);
                      }
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-805 text-white font-extrabold border-l-4 border-indigo-500 pl-2' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-1 rounded-md shrink-0 ${isSelected ? link.color : 'text-slate-500'}`}>
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold tracking-tight leading-tight">{link.label}</div>
                        <div className="text-[9.5px] text-slate-505 leading-tight block truncate mt-0.5">{link.desc}</div>
                      </div>
                    </div>
                    {isLocked && (
                      <span className="p-1 bg-slate-950/40 rounded-md text-slate-500 shrink-0 self-center" title="Requires Authentication">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-855 bg-slate-950/40 space-y-3 font-sans">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-205 flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono">
                  {profile.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-slate-200 block truncate leading-none">{profile.name}</span>
                  <span className="text-[10px] text-slate-405 block truncate font-medium mt-0.5 leading-none">{profile.role}</span>
                  <span className="inline-block mt-1 px-1.5 py-0.5 text-[8.5px] bg-slate-800 text-slate-350 border border-slate-700/60 font-mono rounded font-bold leading-none uppercase">
                    {profile.badge}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setLoggedInUser(null);
                  setLoggedInRole(null);
                  setTargetRoleForLogin(null);
                  setIsMobileNavOpen(false);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-rose-955/80 border border-rose-800/85 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL WRAPPER FOR PERSISTENT SIDEBAR + CONTENT SECTION */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* DESKTOP PERSISTENT LEFT SIDEBAR */}
        <aside className="hidden md:flex md:w-64 shrink-0 bg-slate-900 text-slate-100 flex-col justify-between sticky top-0 h-screen border-r border-slate-850 overflow-y-auto font-sans">
          <div>
            {/* Header branding */}
            <div className="p-5 border-b border-slate-800 flex items-center gap-3">
              <span className="p-1.5 bg-indigo-650 rounded-lg text-white block shadow-sm shrink-0">
                <Building className="w-4.5 h-4.5" />
              </span>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">MedCore Healthcare</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Node Hub</p>
              </div>
            </div>

            {/* Portal navigation links */}
            <div className="px-3 py-5 space-y-1.5">
              <span className="block px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-3">
                Workstation Modules
              </span>
              
              {sidebarLinks.map(link => {
                const LinkIcon = link.icon;
                const isSelected = activePersona === link.id;
                const isLocked = link.id !== loggedInRole;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActivePersona(link.id);
                      } else {
                        setIsLoggedIn(false);
                        setLoggedInUser(null);
                        setLoggedInRole(null);
                        setTargetRoleForLogin(link.id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer group ${
                      isSelected 
                        ? 'bg-slate-805 text-white font-extrabold border-l-4 border-indigo-500 pl-2 shadow-inner' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`p-1 rounded-md shrink-0 ${isSelected ? link.color : 'text-slate-555 group-hover:text-slate-400'}`}>
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold tracking-tight leading-tight">{link.label}</div>
                        <div className="text-[9.5px] text-slate-550 group-hover:text-slate-405 mt-0.5 leading-tight truncate block">
                          {link.desc}
                        </div>
                      </div>
                    </div>
                    {isLocked && (
                      <span className="p-1 bg-slate-950/40 rounded-md text-slate-500 shrink-0 self-center opacity-70 group-hover:opacity-100 transition-opacity" title="Requires Authentication">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected Admin User identity card */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3 font-sans w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-slate-800 border border-slate-700 text-indigo-350 flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono select-none">
                {profile.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-slate-205 block truncate leading-none">{profile.name}</span>
                <span className="text-[10px] text-slate-405 block truncate mt-1 leading-none font-medium">{profile.role}</span>
                <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[8.5px] bg-slate-850 text-slate-300 border border-slate-700/60 font-mono rounded font-bold leading-none uppercase">
                  {profile.badge}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsLoggedIn(false);
                setLoggedInUser(null);
                setLoggedInRole(null);
                setTargetRoleForLogin(null);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-rose-955/80 hover:bg-rose-900 border border-rose-800/70 hover:border-rose-700 text-rose-300 hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors shadow-xs"
              id="header-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* COMPACT MULTI-PANEL VIEWPORT CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen">
          
          {/* DESKTOP STATUS BAR */}
          <div className="hidden md:flex bg-white py-3 px-6 border-b border-slate-200/85 items-center justify-between shadow-xs sticky top-0 z-40">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400">Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 dark:text-slate-100 font-bold capitalize">
                {activePersona.replace('_', ' ')} Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 px-2.5 py-1 rounded-lg">
                🕒 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              
              <button
                onClick={() => {
                  setIsNotificationOpen(true);
                  markAllNotificationsAsRead();
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-slate-250 dark:border-slate-700 relative"
                title="System Notifications Center"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Alerts Hub</span>
                {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length > 0 && (
                  <span className="bg-rose-500 text-[9px] font-extrabold text-white px-1 py-0.2 rounded-full leading-none shrink-0 animate-pulse">
                    {notifications.filter(n => (n.targetRole === 'all' || n.targetRole === activePersona) && !readNotifIds.includes(n.id)).length}
                  </span>
                )}
              </button>

              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-slate-250 dark:border-slate-700"
                title={`Toggle to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MAIN PAGE CANVAS */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50/40 dark:bg-slate-950/20">
            <div className="min-h-[550px] animate-fade-in">
          
          {/* 1. Super Admin Module view */}
          {activePersona === 'super_admin' && (
            <SuperAdminPanel
              hospitals={hospitals}
              branches={branches}
              tickets={tickets}
              auditLogs={auditLogs}
              branchAdmins={branchAdmins}
              licenses={licenses}
              onAddHospital={handleAddHospital}
              onToggleHospitalState={handleToggleHospitalState}
              onAddBranch={handleAddBranch}
              onResolveTicket={handleResolveTicket}
              onTriggerGlobalBroadcast={handleGlobalBroadcast}
              onTriggerSystemBackup={handleSystemBackup}
              onWipeDatabase={handleWipeDatabase}
              onAddBranchAdmin={handleAddBranchAdmin}
              onToggleBranchAdminStatus={handleToggleBranchAdminStatus}
              onDeleteBranchAdmin={handleDeleteBranchAdmin}
              doctors={doctors}
              patients={patients}
            />
          )}

          {/* 2. Branch Administrator view */}
          {activePersona === 'branch_admin' && (
            <BranchAdminPanel
              branch={activeBranch}
              beds={beds.filter(b => b.branchId === activeBranchId)}
              doctors={doctors.filter(d => d.branchId === activeBranchId)}
              staffMembers={staffMembers.filter(s => s.branchId === activeBranchId)}
              staffAdmins={staffAdmins.filter(a => a.branchId === activeBranchId)}
              patients={patients.filter(p => p.branchId === activeBranchId)}
              invoices={invoices.filter(i => i.branchId === activeBranchId)}
              labOrders={labOrders.filter(l => l.branchId === activeBranchId)}
              onAddDoctor={handleAddDoctor}
              onAddPatient={handleAddPatient}
              onUpdateBedStatus={handleUpdateBedStatus}
              onAddInvoice={handleAddInvoice}
              onReconcileInvoice={handleReconcileInvoice}
              inventoryItems={inventoryItems}
              onRestockMedicine={handleRestockMedicine}
              onDischargePatient={handleDischargePatient}
              onSetBedTimer={handleSetBedTimer}
              onExpireBedTimer={handleExpireBedTimer}
              onAddBed={handleAddBed}
              hospitalName={activeHospitalName}
            />
          )}

          {/* 3. Clinical Staff view */}
          {activePersona === 'staff' && (
            <StaffWorkspace
              loggedInUser={loggedInUser}
              patients={patients.filter(p => p.branchId === 'br-1')}
              vitals={vitals}
              fluids={fluids}
              medications={medications}
              handoffs={handoffs}
              emergencyAlert={emergencyAlert}
              onLogVitals={handleLogVitals}
              onLogFluid={handleLogFluid}
              onToggleMedState={handleToggleMedState}
              onAddHandoff={handleAddHandoff}
              onTriggerEmergency={handleTriggerEmergency}
              onResolveEmergency={handleResolveEmergency}
              inventoryItems={inventoryItems}
              onDispensePharmacy={handleDispensePharmacy}
              labOrders={labOrders.filter(l => l.branchId === 'br-1')}
              onUpdateLabStatus={handleUpdateLabStatus}
              appointments={appointments.filter(a => a.branchId === 'br-1')}
            />
          )}

          {/* 3.5. Staff Admin view */}
          {activePersona === 'staff_admin' && (
            <StaffWorkspace
              loggedInUser={loggedInUser}
              patients={patients.filter(p => p.branchId === 'br-1')}
              vitals={vitals}
              fluids={fluids}
              medications={medications}
              handoffs={handoffs}
              emergencyAlert={emergencyAlert}
              onLogVitals={handleLogVitals}
              onLogFluid={handleLogFluid}
              onToggleMedState={handleToggleMedState}
              onAddHandoff={handleAddHandoff}
              onTriggerEmergency={handleTriggerEmergency}
              onResolveEmergency={handleResolveEmergency}
              inventoryItems={inventoryItems}
              onDispensePharmacy={handleDispensePharmacy}
              labOrders={labOrders.filter(l => l.branchId === 'br-1')}
              onUpdateLabStatus={handleUpdateLabStatus}
              appointments={appointments.filter(a => a.branchId === 'br-1')}
              doctors={doctors}
              onAddDoctor={handleAddDoctor}
              isStaffAdmin={true}
            />
          )}

          {/* 4. Practitioner Specialist view */}
          {activePersona === 'doctor' && (
            <DoctorDashboard
              doctor={loggedInUser || doctors[1] || initialDoctors[1]}
              appointments={appointments}
              patients={patients}
              labOrders={labOrders}
              prescriptions={prescriptions}
              onAddPrescription={handleAddPrescription}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            />
          )}

          {/* 5. Family & Patient Portal view */}
          {activePersona === 'patient' && (
            <PatientPortal
              patients={patients}
              doctors={doctors}
              appointments={appointments}
              prescriptions={prescriptions}
              invoices={invoices}
              labOrders={labOrders}
              vitals={vitals}
              notifications={notifications}
              onBookAppointment={handleBookAppointment}
              onPayInvoice={handlePayInvoice}
              loggedInPatientId={loggedInUser?.patientId}
              onLogVitals={handleLogVitals}
              onAddPatient={(pat) => {
                const patId = pat.id || `pat-${Date.now()}`;
                const payload = {
                  ...pat,
                  id: patId,
                  registeredDate: new Date().toISOString().split('T')[0],
                  status: 'Outpatient'
                };
                return addPatientSync(payload).then(() => {
                  appendAuditLog('Patient Portal', `Enrolled new family care member profile: ${payload.name}`);
                  return payload;
                });
              }}
              onUpdatePatient={(pat) => {
                return addPatientSync(pat).then(() => {
                  appendAuditLog('Patient Portal', `Patient profile updated and synchronized: ${pat.name}`);
                  return pat;
                });
              }}
              onAddNotification={(payload) => {
                return addNotificationSync(payload);
              }}
            />
          )}

          </div>
        </main>

        {/* CORE HUMBLE SITE FOOTER (No Tech-Larping, Anti-AI-Slop compliant) */}
        <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 sticky bottom-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>© 2026 MedCore SaaS Healthcare Solutions. All rights reserved.</span>
          </div>
        </footer>

        {/* REAL-TIME TOAST NOTIFICATION POPUPS OVERLAY (Bottom Right corner) */}
        <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => {
            const isUrgent = toast.urgency === 'Urgent';
            const isWarning = toast.urgency === 'Warning';
            return (
              <div 
                key={toast.id}
                className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex gap-3 transition-transform duration-300 animate-slide-in-right bg-white dark:bg-slate-900 ${
                  isUrgent ? 'border-rose-300 dark:border-rose-900' : isWarning ? 'border-amber-300 dark:border-amber-800' : 'border-slate-200 dark:border-slate-800'
                }`}
                style={{ contentVisibility: 'auto' }}
              >
                <div className="mt-0.5">
                  {isUrgent ? (
                    <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-lg text-rose-500">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                  ) : isWarning ? (
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg text-amber-500">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg text-indigo-500">
                      <Bell className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{toast.title}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                      isUrgent ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' : 
                      isWarning ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                    }`}>
                      {toast.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-mono flex items-center justify-between">
                    <span>From: {toast.senderName} ({toast.senderRole})</span>
                    <span>Just Now</span>
                  </div>
                </div>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 self-start p-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* SYSTEM NOTIFICATIONS DRAWER OVERLAY */}
        {isNotificationOpen && (
          <div className="fixed inset-0 z-100 flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsNotificationOpen(false)}
            />
            
            {/* Drawer Body */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl z-10 animate-slide-in-right overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Bell className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Live Notification Hub</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Enterprise Broadcast Gateway</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 p-1">
                <button
                  onClick={() => setActiveNotifTab('inbox')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeNotifTab === 'inbox'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-205'
                  }`}
                >
                  Inbox Log ({notifications.filter(n => n.targetRole === 'all' || n.targetRole === activePersona).length})
                </button>
                <button
                  onClick={() => setActiveNotifTab('compose')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeNotifTab === 'compose'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-205'
                  }`}
                >
                  Compose / Send Alert
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/20 dark:bg-slate-905">
                {activeNotifTab === 'inbox' ? (
                  <div className="space-y-3.5">
                    {/* Mark all as read button optionally */}
                    {notifications.filter(n => n.targetRole === 'all' || n.targetRole === activePersona).length > 0 && (
                      <div className="flex justify-end">
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Mark all loaded as read
                        </button>
                      </div>
                    )}

                    {notifications.filter(n => n.targetRole === 'all' || n.targetRole === activePersona).length === 0 ? (
                      <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
                        <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                        <p className="text-xs font-bold font-sans">No notifications received on your portal yet.</p>
                        <p className="text-[10px] text-slate-400">Broadcast alerts triggered system-wide will propagate here automatically.</p>
                      </div>
                    ) : (
                      notifications
                        .filter(n => n.targetRole === 'all' || n.targetRole === activePersona)
                        .map((notif) => {
                          const isUnread = !readNotifIds.includes(notif.id);
                          const isUrgent = notif.urgency === 'Urgent';
                          const isWarning = notif.urgency === 'Warning';
                          
                          return (
                            <div 
                              key={notif.id}
                              className={`p-3.5 rounded-xl border transition-all ${
                                isUnread 
                                  ? 'bg-indigo-50/45 dark:bg-indigo-950/15 border-indigo-200 dark:border-indigo-900/60 ring-2 ring-indigo-500/5' 
                                  : 'bg-white dark:bg-slate-850 border-slate-150 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />
                                  )}
                                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                                    {notif.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                                    isUrgent ? 'bg-rose-100 text-rose-850 dark:bg-rose-900/40 dark:text-rose-300' :
                                    isWarning ? 'bg-amber-100 text-amber-850 dark:bg-amber-900/40 dark:text-amber-300' :
                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                    {notif.urgency}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotification(notif.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
                                    title="Delete notification"
                                    id={`delete-notif-${notif.id}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-[11px] text-slate-600 dark:text-slate-350 mt-1.5 leading-relaxed font-sans">
                                {notif.message}
                              </p>

                              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                <span>Sender: {notif.senderName} ({notif.senderRole})</span>
                                <span>{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                ) : (
                  /* COMPOSE AND BROADCAST LIVE ALERTS FORM */
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!compTitle.trim() || !compMessage.trim()) {
                      setSendNotifErr("Kindly populate both the alert title and context message.");
                      return;
                    }
                    setSendNotifErr('');
                    setIsSendingNotif(true);

                    try {
                      const payload = {
                        senderId: loggedInUser?.id || loggedInUser?._id || 'user',
                        senderName: profile.name,
                        senderRole: profile.role,
                        title: compTitle.trim(),
                        message: compMessage.trim(),
                        urgency: compUrgency,
                        targetRole: compTarget,
                        timestamp: new Date().toISOString()
                      };

                      await addNotificationSync(payload);

                      // Also dispatch to local real-time audit logs for security
                      appendAuditLog(
                        profile.role, 
                        `Broadcast live event: [${compUrgency.toUpperCase()}] directed at persona: [${compTarget.toUpperCase()}] titled "${compTitle}"`
                      );

                      // Flush input parameters
                      setCompTitle('');
                      setCompMsg('');
                      setSendNotifSuccess(true);
                      setTimeout(() => setSendNotifSuccess(false), 3000);
                      setActiveNotifTab('inbox');
                    } catch (err) {
                      setSendNotifErr(err.message || 'Error occurred publishing notification broadcast.');
                    } finally {
                      setIsSendingNotif(false);
                    }
                  }} className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
                        🚀 <span className="font-bold text-indigo-600 dark:text-indigo-400">Live Synced System alert dispatcher.</span> Composing any notification here will write instantly to the synchronized Firestore database, popping up a visual alert notice in real-time on all clients currently logged into the targeted portal.
                      </p>
                    </div>

                    {sendNotifErr && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-400 text-xs font-bold rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{sendNotifErr}</span>
                      </div>
                    )}

                    {sendNotifSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-850 dark:text-emerald-350 text-xs font-bold rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>Notification broadcast dispatched successfully!</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Receiver Target Portal</label>
                      <select
                        value={compTarget}
                        onChange={(e) => setCompTarget(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">📢 All Portals (Global Broadcast)</option>
                        <option value="super_admin">🛡 Super Admin Portal</option>
                        <option value="branch_admin">🏥 Branch Operations Admin</option>
                        <option value="staff">🩹 Clinical Nursing Staff</option>
                        <option value="doctor">👩‍⚕️ Consulting Practitioner</option>
                        <option value="patient">🏠 Outpatient Portal</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Urgency Level</label>
                      <select
                        value={compUrgency}
                        onChange={(e) => setCompUrgency(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Info">🔵 Info (Standard Update)</option>
                        <option value="Warning">🟡 Warning (Attention Needed)</option>
                        <option value="Urgent">🔴 Urgent (Action Required)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Alert Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Bed Sanitation Clean Complete, Routine Pager"
                        value={compTitle}
                        onChange={(e) => setCompTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-405 tracking-wider block">Detailed Context Message</label>
                      <textarea
                        rows="4"
                        placeholder="Provide details of the alert. Let clinical staff know exactly what needs immediate triage, monitoring, or operation."
                        value={compMessage}
                        onChange={(e) => setCompMsg(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingNotif}
                      className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingNotif ? 'Dispatching Broadcast...' : 'Broadcast Real-Time Alert'}</span>
                    </button>
                  </form>
                )}
              </div>
              
              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/45 text-[9.5px] text-slate-400 text-center font-mono">
                Active Portal Sender identity: <span className="font-bold text-slate-700 dark:text-indigo-400">{profile.name} ({profile.role})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
