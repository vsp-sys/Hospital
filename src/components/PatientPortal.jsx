/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  FolderHeart, Star, Calendar, CreditCard, Layers, Plus, Check, 
  HelpCircle, MessageSquare, ShieldCheck, Sparkles, FileText, Send, 
  TrendingUp, Users, RefreshCw, Clock, AlertTriangle, Play,
  Search, Filter, Download, UserCheck, Bell, PhoneCall, Activity, Heart, Trash2
} from 'lucide-react';

export default function PatientPortal({
  patients = [],
  doctors = [],
  appointments = [],
  prescriptions = [],
  invoices = [],
  labOrders = [],
  vitals = [],
  notifications = [],
  onBookAppointment,
  onPayInvoice,
  loggedInPatientId,
  onLogVitals,
  onAddPatient,
  onUpdatePatient,
  onAddNotification
}) {
  // 1. Core Profile selector
  const [activePatientId, setActivePatientId] = useState(loggedInPatientId || patients[0]?.id || '');
  useEffect(() => {
    if (loggedInPatientId) setActivePatientId(loggedInPatientId);
  }, [loggedInPatientId]);

  const selectedPatient = patients.find(p => p.id === activePatientId) || patients[0] || {
    id: activePatientId || 'pat-1', name: 'Authorized Care Patient', age: 34, gender: 'Male', bloodGroup: 'O+', phone: '+1 555-0192', address: '782 Broad St, Suite 5'
  };

  // 2. Tab selection state
  const [activeSubTab, setActiveSubTab] = useState('wallet');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // 3. Telemetry graphs custom live loop state
  const [liveVitalsData, setLiveVitalsData] = useState([]);
  useEffect(() => {
    const myVitals = (vitals || []).filter(v => v.patientId === activePatientId);
    const parsed = myVitals.map(v => {
      let sys = 120, dia = 80;
      if (v.bloodPressure && typeof v.bloodPressure === 'string' && v.bloodPressure.includes('/')) {
        const pts = v.bloodPressure.split('/');
        sys = Number(pts[0]) || 120;
        dia = Number(pts[1]) || 80;
      }
      return {
        recordedAt: v.recordedAt || 'Recent',
        heartRate: v.heartRate || 75,
        systolic: sys,
        diastolic: dia,
        spO2: v.spO2 || 98,
        bloodSugar: v.bloodSugar || 105
      };
    });

    setLiveVitalsData(parsed.length > 0 ? parsed : [
      { recordedAt: '09:00 AM', heartRate: 72, systolic: 118, diastolic: 76, spO2: 99, bloodSugar: 98 },
      { recordedAt: '12:00 PM', heartRate: 85, systolic: 125, diastolic: 82, spO2: 97, bloodSugar: 120 },
      { recordedAt: '03:00 PM', heartRate: 75, systolic: 120, diastolic: 80, spO2: 98, bloodSugar: 105 },
      { recordedAt: '06:00 PM', heartRate: 78, systolic: 122, diastolic: 79, spO2: 99, bloodSugar: 110 }
    ]);
  }, [vitals, activePatientId]);

  // 4. Doctor Search & Specialty Filter states
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [appointmentDate, setAppointmentDate] = useState('2026-05-26');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM - 10:30 AM');
  const [appointmentType, setAppointmentType] = useState('In-Person');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // 5. Profile Fields form states
  const [editName, setEditName] = useState(selectedPatient.name || '');
  const [editAge, setEditAge] = useState(selectedPatient.age || '');
  const [editGender, setEditGender] = useState(selectedPatient.gender || 'Female');
  const [editBlood, setEditBlood] = useState(selectedPatient.bloodGroup || 'O+');
  const [editPhone, setEditPhone] = useState(selectedPatient.phone || '');
  const [editAddress, setEditAddress] = useState(selectedPatient.address || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setEditName(selectedPatient.name || '');
      setEditAge(selectedPatient.age || '');
      setEditGender(selectedPatient.gender || 'Female');
      setEditBlood(selectedPatient.bloodGroup || 'O+');
      setEditPhone(selectedPatient.phone || '');
      setEditAddress(selectedPatient.address || '');
    }
  }, [selectedPatient]);

  // 6. Family Member additions
  const [fName, setFName] = useState('');
  const [fAge, setFAge] = useState('');
  const [fGender, setFGender] = useState('Female');
  const [fBlood, setFBlood] = useState('O+');
  const [fPhone, setFPhone] = useState('');
  const [familySuccess, setFamilySuccess] = useState(false);

  // 7. Vitals form logging states
  const [vHeartRate, setVHeartRate] = useState('75');
  const [vSys, setVSys] = useState('120');
  const [vDia, setVDia] = useState('80');
  const [vSpO2, setVSpO2] = useState('98');
  const [vSugar, setVSSugar] = useState('100');
  const [vitalsSuccess, setVitalsSuccess] = useState(false);

  // 8. Custom medicine reminders
  const [reminders, setReminders] = useState([
    { id: 'rem-1', name: 'Metropolol Succinate', dose: '50mg', period: 'Morning', taken: false, time: '08:00 AM' },
    { id: 'rem-2', name: 'Atorvastatin Calcium', dose: '10mg', period: 'Night', taken: false, time: '09:00 PM' },
    { id: 'rem-3', name: 'Lisinopril', dose: '10mg', period: 'Noon', taken: false, time: '01:00 PM' }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedPeriod, setNewMedPeriod] = useState('Morning');
  const [newMedTime, setNewMedTime] = useState('08:00 AM');

  // 9. Document files simulated list & uploads
  const [documents, setDocuments] = useState([
    { id: 'doc-1', title: 'Vaccination Passport Certificate.pdf', date: '2026-02-12', category: 'Immunization' },
    { id: 'doc-2', title: 'MedCore Complete EHR Summary.pdf', date: '2026-04-18', category: 'General Summary' },
    { id: 'doc-3', title: 'Ambulatory ECG Graph Sheet.pdf', date: '2026-05-10', category: 'Cardiology Test' }
  ]);
  const [docFileSuccess, setDocFileSuccess] = useState(false);

  // 10. SOS Emergency state trigger
  const [sosActive, setSosActive] = useState(false);
  const [sosStatusStep, setSosStatusStep] = useState(0);

  // 11. Interactive teleconsult stream call
  const [activeTeleconsult, setActiveTeleconsult] = useState(null);

  // 12. Chat Helpdesk states
  const [chatText, setChatText] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'assistant', text: 'Welcome to the MedCore Patient Services Helpdesk. Ask us about dosage schedules, document retrieval, or invoice clearance.', time: '09:00 AM' }
  ]);

  // 13. Payment modal simulator
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [payCardNum, setPayCardNum] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  // Specialties list
  const specialties = ['ALL', 'Cardiology', 'Pediatrics', 'General Medicine', 'Neurology', 'Orthopedics', 'Dermatology'];

  // Actions
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!onUpdatePatient) return;
    const payload = {
      ...selectedPatient,
      name: editName,
      age: parseInt(editAge, 10) || selectedPatient.age,
      gender: editGender,
      bloodGroup: editBlood,
      phone: editPhone,
      address: editAddress
    };
    onUpdatePatient(payload).then(() => {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    });
  };

  const handleAddFamilyMember = (e) => {
    e.preventDefault();
    if (!onAddPatient || !fName) return;
    const payload = {
      name: fName,
      age: parseInt(fAge, 10) || 30,
      gender: fGender,
      bloodGroup: fBlood,
      phone: fPhone,
      address: selectedPatient.address || 'Same as primary contact Address',
      email: `${fName.toLowerCase().replace(/\s+/g, '')}@family.com`,
      branchId: selectedPatient.branchId || 'br-1'
    };
    onAddPatient(payload).then((created) => {
      setFamilySuccess(true);
      setFName('');
      setFAge('');
      setFPhone('');
      if (created?.id) {
        setActivePatientId(created.id);
      }
      setTimeout(() => setFamilySuccess(false), 2500);
    });
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!selectedDocId || !onBookAppointment) return;
    const docObj = doctors.find(d => d.id === selectedDocId);
    if (!docObj) return;

    onBookAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: docObj.id,
      doctorName: docObj.name,
      branchId: selectedPatient.branchId || 'br-1',
      date: appointmentDate,
      timeSlot: appointmentTime,
      type: appointmentType
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveSubTab('booking'); // remain on book tab to see 예약 lists
    }, 2500);
  };

  const handleLogVitalsSubmit = (e) => {
    e.preventDefault();
    if (!onLogVitals) return;
    const vData = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      heartRate: parseInt(vHeartRate, 10),
      bloodPressure: `${vSys}/${vDia}`,
      spO2: parseInt(vSpO2, 10),
      temperature: 98.6,
      bloodSugar: parseInt(vSugar, 10),
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onLogVitals(vData);
    setVitalsSuccess(true);
    setTimeout(() => setVitalsSuccess(false), 2000);
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newMedName) return;
    const newRem = {
      id: `rem-${Date.now()}`,
      name: newMedName,
      dose: newMedDose || '1 pill',
      period: newMedPeriod,
      time: newMedTime,
      taken: false
    };
    setReminders(prev => [...prev, newRem]);
    setNewMedName('');
    setNewMedDose('');
  };

  const handleUploadDocument = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newD = {
      id: `doc-${Date.now()}`,
      title: file.name,
      date: new Date().toISOString().split('T')[0],
      category: 'Self Uploaded File'
    };
    setDocuments(prev => [newD, ...prev]);
    setDocFileSuccess(true);
    setTimeout(() => setDocFileSuccess(false), 2000);
  };

  const triggerSOSAlert = async () => {
    setSosActive(true);
    setSosStatusStep(1);
    if (onAddNotification) {
      await onAddNotification({
        id: `sos-${Date.now()}`,
        title: `🚨 EMERGENCY SOS: Patient ${selectedPatient.name}`,
        message: `Registered patient ${selectedPatient.name} (ID: ${selectedPatient.id}) has triggered a medical crisis alarm from the home portal portal! Contact: ${selectedPatient.phone}.`,
        targetRole: 'all',
        urgency: 'Urgent',
        timestamp: new Date().toISOString()
      });
    }

    // Step progression simulator
    const timers = [
      setTimeout(() => setSosStatusStep(2), 2500),
      setTimeout(() => setSosStatusStep(3), 5000),
      setTimeout(() => setSosStatusStep(4), 8500)
    ];
    return () => timers.forEach(clearTimeout);
  };

  // Safe file downloads simulation helper
  const downloadTextFile = (title, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = title.replace(/\.pdf$/, ".txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter lists for active patient member
  const myAppointments = appointments.filter(apt => apt.patientId === selectedPatient.id);
  const myPrescriptions = prescriptions.filter(pr => pr.patientId === selectedPatient.id);
  const myInvoices = invoices.filter(inv => inv.patientId === selectedPatient.id);
  const myLabs = labOrders.filter(lab => lab.patientId === selectedPatient.id);
  const myNotifications = notifications.filter(n => n.targetRole === 'all' || n.targetRole === 'patient');

  // Filtered doctors list based on specialty and text search
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchDoc.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchDoc.toLowerCase());
    const matchesSpec = selectedSpecialty === 'ALL' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpec;
  });

  // KPI Calculations
  const unpaidInvoicesValue = myInvoices.filter(i => i.status !== 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleSendHelpdeskChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const userMsg = { sender: 'patient', text: chatText, time: 'Now' };
    setChatText('');
    setChatHistory(prev => [...prev, userMsg]);

    let reply = "Your communication has been dispatched to secure nurses. We will call you back on " + selectedPatient.phone + " if needed.";
    const textLower = chatText.toLowerCase();
    if (textLower.includes('doctor') || textLower.includes('appoint')) {
      reply = "You can filter specialized physicians under the 'Consult Booking' tab and book the virtual link right there.";
    } else if (textLower.includes('bill') || textLower.includes('pay') || textLower.includes('clearance')) {
      reply = "Pending billing statements are logged under the 'Bills & Clearances' tab. Use our simulated secure CC gate to settle any outstanding balances.";
    } else if (textLower.includes('pill') || textLower.includes('medicine') || textLower.includes('dose')) {
      reply = "Please review 'Dosage Compliance & Reminders' for active pills lists or to generate custom alarms.";
    }

    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'assistant', text: reply, time: 'Now' }]);
    }, 1000);
  };

  const processPaymentSuccess = () => {
    setPaySuccess(true);
    setTimeout(() => {
      onPayInvoice(checkoutInvoice.id);
      setPaySuccess(false);
      setCheckoutInvoice(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 🔴 RED SOS ACTIVE FLOATING HUB */}
      {sosActive && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-rose-600 text-white rounded-full animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-rose-950 font-sans">Emergency Medical Response Active</h4>
              <p className="text-xs text-rose-700">
                {sosStatusStep === 1 && "Connecting secure medical node, broadcasting satellite coordinates..."}
                {sosStatusStep === 2 && "SOS Received. Paramedic units assigned from downtown ward headquarters."}
                {sosStatusStep === 3 && "Transit Route Mapped (Ambulance ETA: 8 minutes) - Staff physician alerted."}
                {sosStatusStep === 4 && "Clinical Dispatch Established. Keep your line active. Helpline: +1 800-911-MED."}
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-500">
                Registered Address: {selectedPatient.address || 'Address unprovided'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSosActive(false); setSosStatusStep(0); }}
              className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
            >
              Stand Down Alert
            </button>
            <a
              href="tel:911"
              className="px-3.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call 911
            </a>
          </div>
        </div>
      )}

      {/* WEBRTC TELECONSULT COMPONENT */}
      {activeTeleconsult && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]">
            <div className="flex-1 bg-black p-4 flex flex-col justify-between relative">
              <div className="flex justify-between items-center z-10">
                <span className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-850">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-white">Teleconsult Live Feed</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: #{activeTeleconsult.id}</span>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-indigo-900 border-2 border-indigo-500 flex items-center justify-center text-white font-bold text-2xl animate-pulse">
                  {activeTeleconsult.doctorName?.replace("Dr. ", "").substring(0, 2).toUpperCase()}
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold text-white">{activeTeleconsult.doctorName}</h4>
                  <p className="text-xs text-indigo-400">Scheduled Specialist Triage</p>
                </div>
                <div className="flex items-center gap-1 pt-2">
                  {[12, 28, 16, 32, 20, 14, 25].map((h, i) => (
                    <div key={i} className="w-1 bg-teal-400 rounded-full animate-bounce" style={{ height: h, animationDelay: `${i*0.1}s` }} />
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono mt-auto z-10">
                Secure SSL HIPAA Consultation Link • Pipeline Latency: 12ms
              </div>
            </div>
            <div className="w-full md:w-72 bg-slate-900 p-4 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono tracking-widest block uppercase font-bold">Interactive Dialogue</span>
                <div className="mt-3 p-3 bg-slate-950 rounded-xl text-xs space-y-3 h-48 overflow-y-auto border border-slate-800 text-slate-300">
                  <p><strong>System:</strong> Secure feed link created successfully.</p>
                  <p><strong>{activeTeleconsult.doctorName}:</strong> Hello! Standard biotelemetry parameters look stable. Are you experiencing any post-dose symptoms?</p>
                  <p><strong>You:</strong> Feeling better, thank you.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTeleconsult(null)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs py-2.5 rounded-lg font-bold"
              >
                Disconnect Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE ONLINE PAYMENT CHECKOUT DRAWER */}
      {checkoutInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={(e) => { e.preventDefault(); processPaymentSuccess(); }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl"
          >
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                MedCore Secure Split Checkout Gateway
              </h4>
              <button type="button" onClick={() => setCheckoutInvoice(null)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between"><span>Account Holder:</span><strong>{selectedPatient.name}</strong></div>
                <div className="flex justify-between"><span>Billed Node Ref:</span><strong>#{checkoutInvoice.id}</strong></div>
                <div className="flex justify-between text-slate-900 font-bold border-t pt-1.5 mt-1">
                  <span>Grand Total amount:</span><span className="text-rose-700">${checkoutInvoice.totalAmount}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-650 mb-1">Credit / Debit Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={payCardNum}
                    onChange={(e) => setPayCardNum(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-650 mb-1">Expiry Date</label>
                    <input type="text" required placeholder="MM/YY" maxLength={5} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-650 mb-1">CVV Pin</label>
                    <input type="password" required placeholder="***" maxLength={3} className="w-full p-2 bg-white border border-slate-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {paySuccess && (
                <div className="text-center font-bold text-emerald-600 text-xs animate-bounce">
                  ⚡ Authorizing PCI DSS Secure Handshake... Approved!
                </div>
              )}

              <button
                type="submit"
                disabled={paySuccess}
                className="w-full bg-slate-900 text-teal-400 hover:bg-slate-800 disabled:opacity-50 text-xs py-2.5 font-bold rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Release Payment Balance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HEADER CARE HUB BANNER */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <FolderHeart className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedPatient.name}</h2>
              <span className="text-[10px] bg-slate-900 text-teal-400 px-2 py-0.5 rounded font-mono font-bold">
                ID-{selectedPatient.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Age: {selectedPatient.age} yrs • Blood Group: <strong className="text-rose-600 font-bold">{selectedPatient.bloodGroup}</strong> • Contact: {selectedPatient.phone}
            </p>
            <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Address: {selectedPatient.address || "None Specified"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* PROFILE SWITCHER */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">Switch Profile:</span>
            <select
              value={activePatientId}
              onChange={(e) => setActivePatientId(e.target.value)}
              className="p-2 bg-white border border-slate-350 focus:border-rose-500 focus:outline-hidden rounded-xl text-xs font-bold font-sans text-slate-705"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
              ))}
            </select>
          </div>

          <button
            onClick={triggerSOSAlert}
            className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5 uppercase transition-all"
          >
            <Activity className="w-4 h-4 text-white animate-pulse" />
            Trigger Emergency SOS
          </button>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Prescriptions', value: `${myPrescriptions.length} Active`, sub: 'Signed electronically' },
          { label: 'Consult History', value: `${myAppointments.length} Sessions`, sub: `${myAppointments.filter(a=>a.status === 'Scheduled').length} Upcoming scheduled` },
          { label: 'Diagnostics Queue', value: `${myLabs.filter(l=>l.status !== 'Completed').length} Pending`, sub: `${myLabs.filter(l=>l.status === 'Completed').length} Reports resolved` },
          { label: 'Outstanding Balance', value: `$${unpaidInvoicesValue}`, sub: 'Click Billing tab to pay' }
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">{item.label}</span>
            <div className="mt-1.5 text-xl font-bold text-slate-900">{item.value}</div>
            <p className="text-[10px] text-slate-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* SIDE NAV MENU */}
        <div className={`transition-all shrink-0 ${isNavCollapsed ? 'lg:w-16 w-full' : 'lg:w-60 w-full'} lg:sticky lg:top-4 w-full`}>
          <div className="bg-slate-900 border border-slate-850 text-white rounded-xl p-3 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              {!isNavCollapsed && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Access</span>}
              <button onClick={() => setIsNavCollapsed(!isNavCollapsed)} className="text-slate-400 hover:text-white text-xs">
                {isNavCollapsed ? "▶" : "◀"}
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'wallet', label: 'E-Health Wallet Folder', badge: myPrescriptions.length + myLabs.length, icon: FolderHeart },
                { id: 'booking', label: 'Consult Booking Desk', badge: myAppointments.filter(a => a.status === 'Scheduled').length, icon: Calendar },
                { id: 'compliance', label: 'Dosage Compliance', badge: reminders.filter(r=>!r.taken).length, icon: Clock },
                { id: 'billing', label: 'Bills & Clearances', badge: myInvoices.filter(i => i.status !== 'Paid').length, icon: CreditCard },
                { id: 'progress', label: 'Daily Vitals Telemetry', icon: TrendingUp },
                { id: 'profile', label: 'Profile & Family', icon: Users },
                { id: 'chat', label: 'Telereception Chat', icon: MessageSquare },
                { id: 'broadcasts', label: 'Broadcast Alerts', badge: myNotifications.length, icon: Bell }
              ].map(item => {
                const isSelected = activeSubTab === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSubTab(item.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800 font-bold border-l-4 border-rose-500 pl-1.5' : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <IconComp className="w-4 h-4 shrink-0 text-slate-400" />
                      {!isNavCollapsed && <span>{item.label}</span>}
                    </span>
                    {!isNavCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 bg-rose-600 text-[10px] text-white font-mono rounded-full font-bold">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* WORK BENCH CONTENT PANELS */}
        <div className="flex-1 min-w-0 w-full space-y-6">

          {/* E-HEALTH WALLET FOLDER */}
          {activeSubTab === 'wallet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prescriptions card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 pb-3 border-b flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-rose-500" /> Digital Prescription records</span>
                    <span className="text-xs font-mono text-slate-400">{myPrescriptions.length} Records</span>
                  </h3>
                  <div className="mt-4 space-y-4">
                    {myPrescriptions.map(p => (
                      <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-slate-450">
                          <span>Ref: #{p.id}</span>
                          <span>Logged: {p.date}</span>
                        </div>
                        <div className="text-xs">Physician: <strong className="text-slate-800">{p.doctorName}</strong></div>
                        <p className="text-xs italic text-slate-600 bg-white p-2 rounded border border-slate-100">"Diagnosis: {p.diagnosis}"</p>
                        <div className="space-y-1">
                          {p.medicines?.map((m, i) => (
                            <div key={i} className="p-1 px-2 bg-indigo-50/50 text-[11px] font-mono flex justify-between rounded">
                              <span>💊 {m.name} ({m.dosage})</span>
                              <span className="font-bold">{m.duration} • {m.instructions}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => downloadTextFile(`Prescription-${p.id}.txt`, `MedCore Clinical Prescription Record\nPatient: ${selectedPatient.name}\nDoctor: ${p.doctorName}\nDiagnosis: ${p.diagnosis}\nDate: ${p.date}\nMedicines: ${JSON.stringify(p.medicines, null, 2)}`)}
                          className="w-full py-1 bg-white hover:bg-slate-50 border border-slate-250 text-[10px] font-extrabold text-slate-700 rounded flex items-center justify-center gap-1 transition-colors mt-2"
                        >
                          <Download className="w-3 h-3" /> Download Verified Rx Voucher
                        </button>
                      </div>
                    ))}
                    {myPrescriptions.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No prescription files found in active clinical records.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lab Reports card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 pb-3 border-b flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-indigo-500" /> Lab Assays & Reports vault</span>
                    <span className="text-xs font-mono text-slate-400">{myLabs.length} Reports</span>
                  </h3>
                  <div className="mt-4 space-y-4">
                    {myLabs.map(lab => (
                      <div key={lab.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-slate-450">
                          <span>Assay Ref: #{lab.id}</span>
                          <span>Cleared: {lab.orderedDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <strong className="text-xs text-slate-850 font-sans">{lab.testName}</strong>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            lab.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>{lab.status}</span>
                        </div>
                        {lab.result && <p className="text-xs text-slate-650 bg-white p-2 rounded border border-slate-100 font-sans">Lab Remarks: {lab.result}</p>}
                        {lab.status === 'Completed' && (
                          <button
                            onClick={() => downloadTextFile(`LabReport-${lab.id}.txt`, `MedCore Certified Diagnostics Assay Output\nPatient: ${selectedPatient.name}\nTest: ${lab.testName}\nStatus: ${lab.status}\nResult Remarks: ${lab.result}\nRelease Date: ${lab.orderedDate}`)}
                            className="w-full py-1 bg-white hover:bg-slate-50 border border-slate-250 text-[10px] font-extrabold text-slate-700 rounded flex items-center justify-center gap-1 transition-colors mt-2"
                          >
                            <Download className="w-3 h-3" /> Download Certified Lab Sheet
                          </button>
                        )}
                      </div>
                    ))}
                    {myLabs.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No diagnostic lab reports cataloged today.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Secure PDF uploads */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-indigo-500" /> Digital Medical Documents Vault
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Backup or upload immunization schedules, vaccination passports, or personal medical charts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-350 rounded-xl flex flex-col items-center justify-center text-center">
                    <Download className="w-8 h-8 text-slate-400 mb-2" />
                    <label className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Upload PDF Document
                      <input type="file" accept=".pdf" onChange={handleUploadDocument} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2">Supports PDF records up to 15MB</p>
                    {docFileSuccess && <span className="text-xs text-emerald-600 mt-1 font-bold">✔ File successfully archived!</span>}
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {documents.map(d => (
                      <div key={d.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-sans">
                        <div>
                          <strong className="block text-slate-800 truncate max-w-[150px]">{d.title}</strong>
                          <span className="text-[9px] text-slate-400">{d.category} • {d.date}</span>
                        </div>
                        <button
                          onClick={() => downloadTextFile(d.title, `MedCore Dossier: ${d.title}\nDate: ${d.date}\nCategory: ${d.category}\nSecure Cloud Checksum Validated.`)}
                          className="p-1 px-2.5 bg-white border rounded text-[10px] hover:bg-slate-100 flex items-center gap-1 font-bold text-slate-700"
                        >
                          <Download className="w-3 h-3 text-slate-500" /> Get File
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONSULT BOOKING DESK */}
          {activeSubTab === 'booking' && (
            <div className="space-y-6">
              
              {/* Doctor search cards */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Search Doctor directory</h3>
                    <p className="text-xs text-slate-455">Select a practitioner dynamically to assign scheduling slots.</p>
                  </div>
                  
                  {/* Text search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Doctor name, specialty..."
                      value={searchDoc}
                      onChange={(e) => setSearchDoc(e.target.value)}
                      className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl w-full sm:w-60"
                    />
                  </div>
                </div>

                {/* Specialties scroll filters */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 pl-0.5">
                  {specialties.map(spec => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                        selectedSpecialty === spec ? 'bg-slate-900 text-teal-400 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>

                {/* Render Doctor cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDoctors.map(doc => (
                    <div 
                      key={doc.id} 
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                        selectedDocId === doc.id ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <strong className="text-xs text-slate-805 block">{doc.name}</strong>
                          <span className="text-[10px] bg-slate-900 text-teal-400 px-1.5 py-0.2 rounded font-mono shrink-0">★ {doc.rating?.toFixed(1) || '4.8'}</span>
                        </div>
                        <span className="text-[10px] text-indigo-605 font-bold uppercase tracking-wider block mt-0.5">{doc.specialty}</span>
                        <div className="text-[10px] text-slate-500 mt-2 space-y-1">
                          <div>Languages: English, Spanish</div>
                          <div>Virtual Fee: $75 • In-Person: $110</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`w-full py-1 text-center text-[10px] font-bold rounded-lg mt-3 ${
                          selectedDocId === doc.id ? 'bg-rose-600 text-white' : 'bg-slate-900 text-indigo-400'
                        }`}
                      >
                        {selectedDocId === doc.id ? 'Practitioner Selected' : 'Select for Booking'}
                      </button>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-6 text-center sm:col-span-3">No matching physicians found.</p>
                  )}
                </div>
              </div>

              {/* Booking Scheduler form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Book slot */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-850 pb-2 border-b flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-rose-500" /> Appointment Scheduler
                  </h3>
                  
                  <form onSubmit={handleBookSubmit} className="mt-4 space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-650 pb-1 uppercase tracking-widest text-[9px]">Physician Allocated</label>
                      <select
                        required
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="">-- Choose Specialist --</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-650 pb-1 text-[9px]">Select Date</label>
                        <input
                          type="date"
                          required
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-650 pb-1 text-[9px]">Preference Slot</label>
                        <select
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        >
                          <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                          <option value="10:15 AM - 10:45 AM">10:15 AM - 10:45 AM</option>
                          <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                          <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[9px] uppercase">Online Consultation Booking (Select below)</label>
                      <div className="flex gap-2">
                        {['In-Person', 'Telemedicine'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAppointmentType(type)}
                            className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition-all ${
                              appointmentType === type ? 'bg-slate-900 text-teal-400' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {type === 'Telemedicine' ? '🎥 Telehealth' : '🏥 In-Hospital'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {bookingSuccess && (
                      <div className="text-center text-xs font-bold text-emerald-600 animate-pulse">
                        ✔ Consult scheduled and synchronized on physician EHR!
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!selectedDocId}
                      className="w-full py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors uppercase disabled:opacity-50"
                    >
                      Finalize Consult Appointment
                    </button>
                  </form>
                </div>

                {/* My list booked */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-850">My Scheduled Consultations</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-[10px] text-slate-600 rounded font-mono font-bold">{myAppointments.length} Active</span>
                  </div>

                  <div className="overflow-x-auto text-xs text-slate-705">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-mono">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Specialist</th>
                          <th className="px-4 py-3 text-left font-semibold">Timing Window</th>
                          <th className="px-4 py-3 text-center font-semibold">Type</th>
                          <th className="px-4 py-3 text-center font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Direct Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myAppointments.map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{apt.doctorName}</td>
                            <td className="px-4 py-3 font-mono text-[11px]">{apt.date} • {apt.timeSlot}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                apt.type === 'Telemedicine' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-800'
                              }`}>{apt.type}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                apt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800 font-mono animate-pulse'
                              }`}>{apt.status}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {apt.type === 'Telemedicine' && apt.status === 'Scheduled' ? (
                                <button
                                  onClick={() => setActiveTeleconsult(apt)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer flex items-center gap-1 inline-block animate-pulse"
                                >
                                  🎥 Connect Consultation
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No link active</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="p-3 border-t bg-slate-50 text-[10px] text-slate-400 leading-normal">
                    * Interactive WebRTC consulting stream buttons validate automatically 5-minutes prior to slot timeline.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DOSAGE COMPLIANCE */}
          {activeSubTab === 'compliance' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Daily medicine Reminders checklist */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs md:col-span-2 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Drug Intake Compliance & Reminders</h3>
                    <p className="text-xs text-slate-500">Enable reminders, log substance intakes, and protect drug safety cycle.</p>
                  </div>
                  
                  {/* Calculation on compliance */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-450 block font-bold uppercase">Daily Intake Compliance Rate</span>
                    <strong className="text-sm text-emerald-600 font-mono">
                      {Math.floor((reminders.filter(r=>r.taken).length / reminders.length) * 100 || 0)}% Checked
                    </strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300" 
                    style={{ width: `${(reminders.filter(r=>r.taken).length / reminders.length) * 100 || 0}%` }} 
                  />
                </div>

                {/* Reminders layout lists */}
                <div className="divide-y text-xs">
                  {reminders.map(rem => (
                    <div key={rem.id} className="py-3 flex items-center justify-between hover:bg-slate-50/20 pr-1 gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-850">💊 {rem.name}</span>
                          <span className="text-[9px] bg-slate-100 px-1 rounded font-bold font-mono">{rem.dose}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Scheduled: {rem.period} • {rem.time}</div>
                      </div>

                      <button
                        onClick={() => {
                          setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, taken: !r.taken } : r));
                        }}
                        className={`px-3 py-1 text-[10px] font-bold rounded flex items-center gap-1 ${
                          rem.taken ? 'bg-emerald-50 border border-emerald-250 text-emerald-805' : 'bg-slate-900 text-teal-400'
                        }`}
                      >
                        {rem.taken ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Dose Registered
                          </>
                        ) : 'Log Intake Taken'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Reminders Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-850 pb-2 border-b flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> Establish Custom Intake Alarm
                </h3>
                
                <form onSubmit={handleAddReminder} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-650 pb-1 uppercase tracking-widest text-[9px]">Medicine Substance Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lisinopril"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-650 pb-1 uppercase tracking-widest text-[9px]">Dose Specification</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 pill (10mg)"
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-650 pb-1 text-[9px]">Daily Period</label>
                      <select
                        value={newMedPeriod}
                        onChange={(e) => setNewMedPeriod(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Noon">Noon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-650 pb-1 text-[9px]">Exact Time</label>
                      <input
                        type="text"
                        required
                        placeholder="08:00 AM"
                        value={newMedTime}
                        onChange={(e) => setNewMedTime(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold rounded-lg text-xs uppercase"
                  >
                    Confirm Alert Schedule
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* BILLS & CLEARANCES */}
          {activeSubTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
              
              {/* Active outstanding invoices */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-850">Pending Invoice Statements</span>
                  <span className="px-2 py-0.5 bg-red-50 text-[10px] text-red-600 rounded font-mono font-bold">{myInvoices.filter(i=>i.status !== 'Paid').length} Unpaid</span>
                </div>

                <div className="divide-y">
                  {myInvoices.filter(inv => inv.status !== 'Paid').map(inv => (
                    <div key={inv.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-slate-800">Invoice Ref: #{inv.id}</strong>
                          <span className="px-1.5 py-0.2 bg-amber-50 border border-amber-205 text-amber-805 rounded text-[10px] font-mono animate-pulse">{inv.status}</span>
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">Billed Balance: <strong className="text-rose-700 text-sm font-bold font-sans">${inv.totalAmount}</strong></div>
                        <div className="text-[10px] text-slate-450 italic">Standard outpatient clinical split services fee summary.</div>
                      </div>

                      <button
                        onClick={() => setCheckoutInvoice(inv)}
                        className="px-4 py-2 bg-slate-900 text-teal-400 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Initialize Secure Payment
                      </button>
                    </div>
                  ))}
                  {myInvoices.filter(inv => inv.status !== 'Paid').length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-8">Your account is fully synchronized. Zero outstanding clearances.</p>
                  )}
                </div>
              </div>

              {/* Verified payments history */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-850 pb-2 border-b flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Historic Payments Archive
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  View and verify audit certifications of cleared ledgers and receipts processed through PCI compliance gateways.
                </p>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {myInvoices.filter(inv => inv.status === 'Paid').map(inv => (
                    <div key={inv.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>Cleared Tx: #{inv.id}</span>
                        <span>Date: Checked</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <strong className="text-emerald-700 font-bold font-sans">${inv.totalAmount} Cleared</strong>
                        <span className="text-[10px] bg-emerald-50 text-emerald-805 border border-emerald-150 px-2 rounded font-bold">Paid</span>
                      </div>
                      <button
                        onClick={() => downloadTextFile(`Receipt-${inv.id}.txt`, `MEDCORE SECURE PAYMENT RECIEPT\nInvoice reference: #${inv.id}\nPatient Name: ${selectedPatient.name}\nSettled Amount: $${inv.totalAmount}\nGate Stamp: AUTHORIZED_PCI_COMPLIANT_SSL\nDiagnostic split reconciled.`)}
                        className="w-full py-1 text-center bg-white border border-slate-210 text-[9px] hover:bg-slate-50 rounded font-semibold text-slate-650"
                      >
                        Receipt Receipt Voucher
                      </button>
                    </div>
                  ))}
                  {myInvoices.filter(inv => inv.status === 'Paid').length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No previous completed statements filed.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DAILY VITALS TELEMETRY */}
          {activeSubTab === 'progress' && (
            <div className="space-y-6">
              
              {/* Log daily parameters */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Uptake Daily Bio-Records Terminal</h3>
                    <p className="text-xs text-slate-500">Log body parameters to instantly re-chart clinical vitals graphs.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded text-xs tracking-wide font-extrabold flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Database Uplink Live
                  </span>
                </div>

                <form onSubmit={handleLogVitalsSubmit} className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-650 pb-1">Heart Pulse (BPM)</label>
                    <input
                      type="number"
                      required
                      value={vHeartRate}
                      onChange={(e) => setVHeartRate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-650 pb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={vSys}
                      onChange={(e) => setVSys(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-650 pb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={vDia}
                      onChange={(e) => setVDia(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-650 pb-1">Oxygen SpO2 (%)</label>
                    <input
                      type="number"
                      required
                      value={vSpO2}
                      onChange={(e) => setVSpO2(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-650 pb-1">Blood Sugar (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={vSugar}
                      onChange={(e) => setVSSugar(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  {vitalsSuccess && <p className="col-span-2 sm:col-span-5 text-center font-bold text-xs text-emerald-600 animate-pulse">✔ Bio-parameters logged into secure hospital cloud nodes!</p>}

                  <button
                    type="submit"
                    className="col-span-2 sm:col-span-5 py-2.5 bg-slate-900 text-teal-400 hover:bg-slate-800 font-extrabold text-xs rounded-xl cursor-pointer uppercase font-sans tracking-wide shadow"
                  >
                    Transmit daily biometrics logs
                  </button>
                </form>
              </div>

              {/* Graphs charts group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Heart Rate Area chart */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Pulse metrics</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Continuous Heart rate Beats (BPM) & SpO2 (%) Trends</h4>
                  </div>
                  <div className="h-52 w-full bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={liveVitalsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colHr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="recordedAt" tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                        <YAxis tick={{ fontSize: 9 }} stroke="#cbd5e1" domain={[40, 110]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2.5} fill="url(#colHr)" name="Pulse Beats" />
                        <Area type="monotone" dataKey="spO2" stroke="#3b82f6" strokeWidth={1.5} name="SpO2 (%)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Blood Pressure Line chart */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Vascular trends</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Vascular Pressure History (Systolic/Diastolic)</h4>
                  </div>
                  <div className="h-52 w-full bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={liveVitalsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="recordedAt" tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                        <YAxis tick={{ fontSize: 9 }} stroke="#cbd5e1" domain={[50, 160]} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="systolic" stroke="#6366f1" strokeWidth={2.5} name="Systolic (mmHg)" />
                        <Line type="monotone" dataKey="diastolic" stroke="#0d9488" strokeWidth={2} name="Diastolic (mmHg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE & FAMILY */}
          {activeSubTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Details board */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 pb-3 border-b flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-rose-500" /> Secure Profile Management
                </h3>
                
                <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 text-xs font-sans">
                  <div>
                    <label className="block font-bold text-slate-600 pb-1 text-[10px]">Family Member Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[10px]">Age</label>
                      <input
                        type="number"
                        required
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-640 pb-1 text-[10px]">Gender</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-640 pb-1 text-[10px]">Blood group</label>
                      <select
                        value={editBlood}
                        onChange={(e) => setEditBlood(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[10px]">Secure phone Number</label>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[10px]">Digital Mail Contact</label>
                      <input
                        type="text"
                        disabled
                        value={selectedPatient.email || 'None'}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 pb-1 text-[10px]">Secure Home Address</label>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  {profileSuccess && <p className="text-center font-bold text-emerald-600 text-xs animate-bounce">✔ Personal profile database node updated!</p>}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 text-teal-400 font-bold rounded-xl cursor-pointer hover:bg-slate-800 uppercase tracking-wide"
                  >
                    Synchronize Profile Updates
                  </button>
                </form>
              </div>

              {/* Family Members additions block */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-3 border-b flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" /> Manage Family Care Members
                </h3>
                <p className="text-xs text-slate-500 leading-normal leading-relaxed">
                  Add children, spouse, or elder dependants under this authenticated credentials set to coordinate multi-profile consults.
                </p>

                <form onSubmit={handleAddFamilyMember} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 pb-1 text-[9px]">Full Member Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jessica Thompson"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[9px]">Age</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 12"
                        value={fAge}
                        onChange={(e) => setFAge(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[9px]">Gender</label>
                      <select
                        value={fGender}
                        onChange={(e) => setFGender(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 pb-1 text-[9px]">Blood group</label>
                      <select
                        value={fBlood}
                        onChange={(e) => setFBlood(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O-">O-</option>
                        <option value="B-">B-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-655 pb-1 text-[9px]">Contact Phone number</label>
                    <input
                      type="text"
                      placeholder="+1 555-0122"
                      value={fPhone}
                      onChange={(e) => setFPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  {familySuccess && <span className="text-xs text-emerald-600 block text-center font-bold">✔ Family member synchronized! Switching active selector profile...</span>}

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 uppercase cursor-pointer text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Enroll family member
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CHAT HELPDESK */}
          {activeSubTab === 'chat' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[400px]">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Support Communications Desk</span>
                <span className="text-slate-400 font-mono font-bold uppercase tracking-widest text-[9px]">Direct triage messaging channel</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/20">
                {chatHistory.map((chat, i) => {
                  const isPatient = chat.sender === 'patient';
                  return (
                    <div key={i} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 max-w-sm rounded-xl text-xs font-sans leading-normal ${
                        isPatient ? 'bg-rose-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                      }`}>
                        {chat.text}
                        <span className={`text-[9px] block text-right mt-1.5 font-mono ${isPatient ? 'text-rose-200' : 'text-slate-400'}`}>{chat.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSendHelpdeskChat} className="p-3 border-t bg-white flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ask assistance about scheduling, invoice payments, prescription downloads..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
                <button type="submit" className="px-4 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold rounded-xl text-xs uppercase cursor-pointer">
                  Send Message
                </button>
              </form>
            </div>
          )}

          {/* BROADCAST ALERTS */}
          {activeSubTab === 'broadcasts' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">Broadcast Pagers & Notification Center</span>
                <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">{myNotifications.length} Alerts</span>
              </div>

              <div className="divide-y">
                {myNotifications.map(notif => {
                  const isUrgent = notif.urgency === 'Urgent';
                  const isWarning = notif.urgency === 'Warning';
                  return (
                    <div key={notif.id} className="p-4 flex gap-3.5 hover:bg-slate-50/20 items-start">
                      <span className={`p-2 rounded-lg shrink-0 ${
                        isUrgent ? 'bg-rose-50 text-rose-650' : isWarning ? 'bg-amber-50 text-amber-650' : 'bg-slate-100 text-indigo-650'
                      }`}>
                        <Bell className="w-4 h-4 animate-pulse" />
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center font-bold flex-wrap gap-2">
                          <span className="text-slate-800">{notif.title}</span>
                          <span className="text-[9px] font-mono text-slate-400">{notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : 'Recent'}</span>
                        </div>
                        <p className="text-slate-505 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
                {myNotifications.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-10">No broadcast pager updates received on this clinic node.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
