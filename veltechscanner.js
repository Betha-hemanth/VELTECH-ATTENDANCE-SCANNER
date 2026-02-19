import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Camera, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Calendar,
  Users,
  User,
  Hash,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Check,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';


 
 
const apiKey = ""; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

async function analyzeIDCard(base64Image) {
  const prompt = `Analyze this image of what should be a Vel Tech University student ID card.

IMPORTANT: You must verify this is a GENUINE Vel Tech University ID card by checking:
1. Presence of Vel Tech University logo (or text "Vel Tech")
2. Student information format typical of university ID cards
3. VTU Number format (usually alphanumeric like "VTU12345" or similar pattern)

If this is NOT a Vel Tech ID card, or if it's any other object/document:
- Set is_valid to false
- Set rejection_reason to explain why

If this IS a valid Vel Tech ID card:
- Extract the student name
- Extract the VTU number/Registration number
- Set is_valid to true

Be STRICT - only accept genuine Vel Tech University ID cards. Return ONLY JSON.`;

  const payload = {
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          is_valid: { type: "BOOLEAN" },
          is_vel_tech_card: { type: "BOOLEAN" },
          student_name: { type: "STRING" },
          vtu_number: { type: "STRING" },
          rejection_reason: { type: "STRING" },
          confidence: { type: "NUMBER" }
        },
        required: ["is_valid", "is_vel_tech_card", "student_name", "vtu_number"]
      }
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error('Failed to analyze image');
  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
}


 
 

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl overflow-hidden border border-slate-100 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled, variant = "primary", className = "", size = "md" }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = "", onKeyDown }) => (
  <input 
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    onKeyDown={onKeyDown}
    className={`w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${className}`}
  />
);


 
 

const OfflineStorage = {
  STORAGE_KEY: 'veltech_attendance_session',
  saveSession: (sessionData) => {
    try {
      localStorage.setItem('veltech_attendance_session', JSON.stringify({
        ...sessionData,
        lastSaved: new Date().toISOString()
      }));
    } catch (e) { console.error(e); }
  },
  loadSession: () => {
    try {
      const data = localStorage.getItem('veltech_attendance_session');
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  clearSession: () => localStorage.removeItem('veltech_attendance_session')
};


 
 

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); setShowStatus(true); setTimeout(() => setShowStatus(false), 3000); };
    const handleOffline = () => { setIsOnline(false); setShowStatus(true); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setShowStatus(true);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  if (!showStatus) return null;
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${isOnline ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce`}>
      {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      <span className="text-sm font-medium">{isOnline ? 'Back Online' : 'Offline Mode'}</span>
    </div>
  );
};

const SlotSelector = ({ onSlotSelect, deferredPrompt, onInstall }) => {
  const [customSlot, setCustomSlot] = useState('');
  const presets = [
    { name: "Morning Session", icon: Sun, time: "9:00 AM - 12:00 PM" },
    { name: "Afternoon Session", icon: Clock, time: "12:00 PM - 3:00 PM" },
    { name: "Evening Session", icon: Sunset, time: "3:00 PM - 6:00 PM" },
    { name: "Night Session", icon: Moon, time: "6:00 PM - 9:00 PM" },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white mb-4 shadow-lg p-2 overflow-hidden">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f674295e8af873ecd5824/58fa4e100_veltechlogo.jpeg" alt="Vel Tech" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Veltech Attendance</h1>
        <p className="text-slate-500">Select session slot to begin scanning</p>
      </div>

      {deferredPrompt && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="text-blue-600" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Install App</p>
                <p className="text-xs text-blue-700">Add to your home screen for quick access.</p>
              </div>
            </div>
            <Button onClick={onInstall} size="sm" className="w-full sm:w-auto">Install Now</Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 shadow-xl shadow-slate-200/50">
        <CardHeader><CardTitle className="text-slate-700">Quick Select</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((slot) => (
            <Button key={slot.name} variant="outline" className="h-auto py-4 px-4 flex-col items-start gap-1 group" onClick={() => onSlotSelect(slot.name)}>
              <div className="flex items-center gap-2 w-full">
                <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200"><slot.icon className="w-4 h-4 text-blue-600" /></div>
                <span className="font-semibold">{slot.name}</span>
              </div>
              <span className="text-xs text-slate-400 ml-10">{slot.time}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-xl shadow-slate-200/50">
        <CardHeader><CardTitle className="text-slate-700">Custom Slot</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="e.g. Lab, Tutorial..." value={customSlot} onChange={e => setCustomSlot(e.target.value)} onKeyDown={e => e.key === 'Enter' && customSlot.trim() && onSlotSelect(customSlot.trim())} />
          <Button disabled={!customSlot.trim()} onClick={() => onSlotSelect(customSlot)}>Start</Button>
        </CardContent>
      </Card>
    </div>
  );
};

const CameraScanner = ({ onScanResult, scannedVtuNumbers, isProcessing, setIsProcessing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanStatus, setScanStatus] = useState('ready');
  const [statusMessage, setStatusMessage] = useState('Position ID card in frame');
  const streamRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { setStatusMessage('Camera access denied'); }
    };
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const captureAndProcess = useCallback(async () => {
    if (isProcessing || !videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    setScanStatus('scanning');
    setStatusMessage('Scanning ID card...');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      const result = await analyzeIDCard(base64);

      if (!result.is_valid) {
        setScanStatus('invalid');
        setStatusMessage(result.rejection_reason || 'Invalid ID Card');
        setTimeout(() => { setScanStatus('ready'); setStatusMessage('Position ID card in frame'); setIsProcessing(false); }, 2500);
        return;
      }

      const vtu = result.vtu_number.toUpperCase().replace(/\s/g, '');
      if (scannedVtuNumbers.has(vtu)) {
        setScanStatus('duplicate');
        setStatusMessage('ID Already Scanned!');
        setTimeout(() => { setScanStatus('ready'); setStatusMessage('Position ID card in frame'); setIsProcessing(false); }, 2500);
        return;
      }

      setScanStatus('success');
      setStatusMessage(`✓ ${result.student_name}`);
      onScanResult({ student_name: result.student_name, vtu_number: vtu });
      setTimeout(() => { setScanStatus('ready'); setStatusMessage('Position next card'); setIsProcessing(false); }, 1500);

    } catch (err) {
      setScanStatus('error');
      setStatusMessage('Scan failed. Try again.');
      setTimeout(() => { setScanStatus('ready'); setIsProcessing(false); }, 2000);
    }
  }, [isProcessing, scannedVtuNumbers, onScanResult, setIsProcessing]);

  useEffect(() => {
    const interval = setInterval(() => { if (!isProcessing && scanStatus === 'ready') captureAndProcess(); }, 3000);
    return () => clearInterval(interval);
  }, [isProcessing, scanStatus, captureAndProcess]);

  const colors = { success: 'bg-green-500', error: 'bg-red-500', invalid: 'bg-red-500', duplicate: 'bg-amber-500', scanning: 'bg-blue-500', ready: 'bg-slate-800' };
  const icons = { success: <CheckCircle />, error: <XCircle />, invalid: <XCircle />, duplicate: <AlertTriangle />, scanning: <Loader2 className="animate-spin" />, ready: <Camera /> };

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] shadow-2xl">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <div className="absolute inset-0 pointer-events-none border-[16px] border-black/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 border-2 border-dashed border-white/50 rounded-xl" />
          {scanStatus === 'scanning' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 animate-pulse" style={{ top: '50%' }} />}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className={`p-4 rounded-xl text-white flex items-center gap-3 transition-colors ${colors[scanStatus]}`}>
        {icons[scanStatus]}
        <span className="font-semibold">{statusMessage}</span>
      </div>
    </div>
  );
};

const AttendanceList = ({ records }) => (
  <Card className="shadow-lg shadow-slate-200/50">
    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
      <CardTitle className="flex items-center gap-2 text-slate-700">
        <Users className="w-5 h-5 text-blue-600" /> Recent Scans
      </CardTitle>
      <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-bold">{records.length}</div>
    </CardHeader>
    <CardContent className="p-0 max-h-[400px] overflow-y-auto">
      {records.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Start scanning ID cards</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {records.map((r, i) => (
            <div key={r.vtu_number + i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{records.length - i}</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{r.student_name}</p>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Hash className="w-3 h-3"/> {r.vtu_number}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {r.scan_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);


 
 

export default function App() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [scannedVtuNumbers, setScannedVtuNumbers] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  
  useEffect(() => {
    
    const metaTags = [
      { name: 'theme-color', content: '#2563eb' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'VT Attendance' }
    ];

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    
    const manifest = {
      name: "Veltech Attendance Scanner",
      short_name: "VT Attendance",
      start_url: "/",
      display: "standalone",
      background_color: "#f8fafc",
      theme_color: "#2563eb",
      icons: [
        {
          src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f674295e8af873ecd5824/58fa4e100_veltechlogo.jpeg",
          sizes: "192x192",
          type: "image/jpeg"
        }
      ]
    };
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestURL;

    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      URL.revokeObjectURL(manifestURL);
    };
  }, []);

  useEffect(() => {
    const saved = OfflineStorage.loadSession();
    if (saved?.selectedSlot) {
      setSelectedSlot(saved.selectedSlot);
      setAttendanceRecords(saved.attendanceRecords || []);
      setScannedVtuNumbers(new Set(saved.scannedVtuNumbers || []));
    }
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => {
    if (selectedSlot) {
      OfflineStorage.saveSession({
        selectedSlot,
        attendanceRecords,
        scannedVtuNumbers: Array.from(scannedVtuNumbers)
      });
    }
  }, [selectedSlot, attendanceRecords, scannedVtuNumbers]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleScanResult = (result) => {
    const now = new Date();
    const record = {
      ...result,
      slot_name: selectedSlot,
      scan_date: now.toISOString().split('T')[0],
      scan_time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAttendanceRecords(prev => [record, ...prev]);
    setScannedVtuNumbers(prev => new Set([...prev, result.vtu_number]));
  };

  const exportCSV = () => {
    const headers = ["Name", "VTU Number", "Slot", "Date", "Time"];
    const csv = [headers.join(','), ...attendanceRecords.map(r => `"${r.student_name}","${r.vtu_number}","${r.slot_name}","${r.scan_date}","${r.scan_time}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedSlot.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (attendanceRecords.length && !confirm("Clear all current data?")) return;
    OfflineStorage.clearSession();
    setSelectedSlot(null);
    setAttendanceRecords([]);
    setScannedVtuNumbers(new Set());
  };

  if (!selectedSlot) return (
    <div className="min-h-screen bg-slate-50">
      <SlotSelector 
        onSlotSelect={setSelectedSlot} 
        deferredPrompt={deferredPrompt} 
        onInstall={handleInstall} 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <NetworkStatus />
      
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleReset}><ArrowLeft className="w-4 h-4"/> Change Slot</Button>
          <div className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f674295e8af873ecd5824/58fa4e100_veltechlogo.jpeg" alt="Logo" className="w-8 h-8 object-contain" />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">Veltech Attendance</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase">{selectedSlot}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4"/></Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
            <AlertCircle className="shrink-0" />
            <p className="text-sm"><strong>Offline Mode:</strong> Scanning requires internet. Existing records are safe.</p>
          </div>
        )}

        {isOnline ? (
          <CameraScanner 
            onScanResult={handleScanResult} 
            scannedVtuNumbers={scannedVtuNumbers} 
            isProcessing={isProcessing} 
            setIsProcessing={setIsProcessing} 
          />
        ) : (
          <div className="bg-slate-100 p-12 rounded-2xl text-center border-2 border-dashed border-slate-200">
            <WifiOff className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">Connect to internet to enable scanning</p>
          </div>
        )}

        <Button 
          disabled={attendanceRecords.length === 0} 
          onClick={exportCSV} 
          className="w-full h-16 text-lg shadow-lg shadow-blue-200"
        >
          <FileSpreadsheet /> Export CSV ({attendanceRecords.length} Students)
        </Button>

        <AttendanceList records={attendanceRecords} />
        
        <p className="text-center text-[10px] text-slate-400 font-medium pt-4">
          VEL TECH RANGARAJAN DR. SAGUNTHALA R&D INSTITUTE OF SCIENCE AND TECHNOLOGY
        </p>
      </main>
    </div>
  );

}
