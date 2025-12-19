import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import { createRoot } from "react-dom/client";
import Editor from "@monaco-editor/react";
import {
  Activity,
  Server,
  Code,
  Users,
  Shield,
  LayoutDashboard,
  BookOpen,
  LogOut,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Database,
  Lock,
  Eye,
  Terminal,
  FileText,
  Settings,
  UserCheck,
  Sun,
  Moon,
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  LogIn,
  ChevronRight,
  Bell
} from "lucide-react";

// --- Types & Interfaces ---

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
}

interface Microservice {
  id: string;
  name: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latency: number; // ms
  load: number; // percentage
  type: "CORE" | "ASSESSMENT" | "COMPUTE" | "SUPPORT";
}

interface ExamQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  starterCode: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// --- Contexts ---

const NotificationContext = createContext({
  addNotification: (type: Notification['type'], message: string) => {}
});

// --- Mock Data ---

const MOCK_SERVICES: Microservice[] = [
  { id: "gw", name: "API Gateway", status: "HEALTHY", latency: 12, load: 45, type: "CORE" },
  { id: "auth", name: "Auth & Identity", status: "HEALTHY", latency: 24, load: 30, type: "CORE" },
  { id: "course", name: "Course Service", status: "HEALTHY", latency: 45, load: 20, type: "CORE" },
  { id: "prob", name: "Problem Service", status: "HEALTHY", latency: 32, load: 15, type: "ASSESSMENT" },
  { id: "test", name: "Test Service", status: "HEALTHY", latency: 56, load: 60, type: "ASSESSMENT" },
  { id: "exec", name: "Code Execution", status: "DEGRADED", latency: 450, load: 85, type: "COMPUTE" },
  { id: "proc", name: "Proctoring AI", status: "HEALTHY", latency: 120, load: 70, type: "COMPUTE" },
  { id: "sub", name: "Submission Svc", status: "HEALTHY", latency: 40, load: 55, type: "ASSESSMENT" },
  { id: "db-shard-1", name: "DB Shard 01", status: "HEALTHY", latency: 5, load: 40, type: "SUPPORT" },
  { id: "kafka", name: "Kafka Cluster", status: "HEALTHY", latency: 2, load: 65, type: "SUPPORT" },
];

const MOCK_QUESTION: ExamQuestion = {
  id: "q1",
  title: "Array Manipulation: Two Sum",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
  difficulty: "Medium",
  points: 20,
  starterCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`
};

const MOCK_USERS_DB: User[] = [
  { id: "s1", name: "Alex Student", email: "alex.s@uni.edu", role: "STUDENT", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", status: "ACTIVE", lastLogin: "2023-10-24 09:30" },
  { id: "i1", name: "Prof. Sarah Jenkins", email: "sarah.j@uni.edu", role: "INSTRUCTOR", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "ACTIVE", lastLogin: "2023-10-24 08:15" },
  { id: "a1", name: "System Admin", email: "admin@uni.edu", role: "ADMIN", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin", status: "ACTIVE", lastLogin: "2023-10-24 07:00" },
  { id: "s2", name: "John Doe", email: "john.d@uni.edu", role: "STUDENT", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", status: "INACTIVE", lastLogin: "2023-09-15 14:20" },
  { id: "i2", name: "Dr. Emily Chen", email: "emily.c@uni.edu", role: "INSTRUCTOR", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily", status: "ACTIVE", lastLogin: "2023-10-23 16:45" },
];

// --- Shared Components ---

const NotificationContainer = () => {
  // This would typically tap into the context to render toasts
  // For this implementation, we'll implement the rendering inside the provider or just use a portal if needed
  // But for simplicity in a single file, we'll manage state in the App component
  return null; 
};

const ServiceCard: React.FC<{ service: Microservice }> = ({ service }) => {
  const statusColors = {
    HEALTHY: "bg-emerald-500",
    DEGRADED: "bg-amber-500",
    DOWN: "bg-red-500",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          {service.type === "CORE" && <Database size={16} />}
          {service.type === "COMPUTE" && <Cpu size={16} />}
          {service.type === "ASSESSMENT" && <FileText size={16} />}
          {service.type === "SUPPORT" && <Server size={16} />}
          {service.name}
        </h3>
        <span className={`h-2.5 w-2.5 rounded-full ${statusColors[service.status]} animate-pulse`}></span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-slate-400">Latency</span>
          <span className="font-mono">{service.latency}ms</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-slate-400">Load</span>
          <div className="flex items-center gap-1">
             <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${service.load}%` }}></div>
             </div>
             <span className="text-xs">{service.load}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- View Components ---

const LoginScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-900/50">
             U
           </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome to UniScale</h1>
        <p className="text-slate-400 text-center mb-8">Enterprise Learning Management & Assessment</p>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin(MOCK_USERS_DB[0])}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex items-center justify-between group transition-all border border-slate-600 hover:border-blue-500/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                <UserCheck size={20} className="text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Student Portal</p>
                <p className="text-xs text-slate-400">Access exams & courses</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button 
             onClick={() => onLogin(MOCK_USERS_DB[1])}
             className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex items-center justify-between group transition-all border border-slate-600 hover:border-purple-500/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                <BookOpen size={20} className="text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Instructor Console</p>
                <p className="text-xs text-slate-400">Manage curriculum & grading</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button 
             onClick={() => onLogin(MOCK_USERS_DB[2])}
             className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex items-center justify-between group transition-all border border-slate-600 hover:border-emerald-500/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-600/20 transition-colors">
                <Shield size={20} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">System Admin</p>
                <p className="text-xs text-slate-400">Infrastructure & Identity</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Secure connection established • v2.4.0-stable
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [services, setServices] = useState(MOCK_SERVICES);

  // Simulate live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        latency: Math.max(1, s.latency + (Math.random() * 20 - 10)),
        load: Math.min(100, Math.max(0, s.load + (Math.random() * 10 - 5)))
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Architecture & Health</h1>
        <p className="text-slate-500">Real-time monitoring of UniScale Microservices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900">2.4M</p>
            </div>
            <Activity className="text-blue-500" />
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">System Uptime</p>
              <p className="text-2xl font-bold text-emerald-900">99.99%</p>
            </div>
            <CheckCircle className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Active Workers</p>
              <p className="text-2xl font-bold text-amber-900">142</p>
            </div>
            <Cpu className="text-amber-500" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Active Exams</p>
              <p className="text-2xl font-bold text-purple-900">18</p>
            </div>
            <BookOpen className="text-purple-500" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Server size={20} />
          Service Mesh Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway & Auth</h3>
              {services.filter(s => s.type === "CORE").map(s => <ServiceCard key={s.id} service={s} />)}
           </div>
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assessment Domain</h3>
              {services.filter(s => s.type === "ASSESSMENT").map(s => <ServiceCard key={s.id} service={s} />)}
           </div>
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compute Cluster</h3>
              {services.filter(s => s.type === "COMPUTE").map(s => <ServiceCard key={s.id} service={s} />)}
           </div>
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data & Support</h3>
              {services.filter(s => s.type === "SUPPORT").map(s => <ServiceCard key={s.id} service={s} />)}
           </div>
        </div>
      </div>

       <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm">
        <div className="flex items-center gap-2 text-emerald-400 mb-4 border-b border-slate-700 pb-2">
          <Terminal size={16} />
          <span>Cluster Events Stream</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
           <div className="flex gap-4">
             <span className="text-slate-500">10:42:01</span>
             <span className="text-blue-400">[INFO]</span>
             <span>Scaled up `execution-worker` to 142 replicas (HPA trigger)</span>
           </div>
           <div className="flex gap-4">
             <span className="text-slate-500">10:41:58</span>
             <span className="text-emerald-400">[SUCCESS]</span>
             <span>Submission #99281 processed in 450ms</span>
           </div>
           <div className="flex gap-4">
             <span className="text-slate-500">10:41:45</span>
             <span className="text-amber-400">[WARN]</span>
             <span>Proctoring AI service high memory usage (85%)</span>
           </div>
           <div className="flex gap-4">
             <span className="text-slate-500">10:41:30</span>
             <span className="text-blue-400">[INFO]</span>
             <span>New Exam "CS101 Final" started. 1,204 students connected.</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS_DB);
  const [searchTerm, setSearchTerm] = useState("");
  const { addNotification } = useContext(NotificationContext);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        addNotification("info", `User ${u.name} status changed to ${newStatus}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage student and faculty accounts</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
           <div className="relative flex-1">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search users by name or email..."
               className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex gap-2">
             <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none">
               <option value="ALL">All Roles</option>
               <option value="STUDENT">Student</option>
               <option value="INSTRUCTOR">Instructor</option>
               <option value="ADMIN">Admin</option>
             </select>
           </div>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    user.role === 'INSTRUCTOR' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                     user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                   }`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                     {user.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(user.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    >
                      {user.status === "ACTIVE" ? <Lock size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
           <div className="p-12 text-center text-slate-400">
             No users found matching your search.
           </div>
        )}
      </div>
    </div>
  );
}

const StudentExamInterface = () => {
  const STORAGE_KEY = `uniscale_exam_answer_${MOCK_QUESTION.id}`;
  const { addNotification } = useContext(NotificationContext);
  
  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || MOCK_QUESTION.starterCode;
    } catch (e) {
      return MOCK_QUESTION.starterCode;
    }
  });

  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "SUCCESS" | "FAILED">("IDLE");
  const [output, setOutput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [proctorFlags, setProctorFlags] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Ref to hold latest code for the interval closure
  const codeRef = useRef(code);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    // Initialize Webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Webcam error:", err);
          addNotification("error", "Could not access webcam. Proctoring inactive.");
        });
    }

    // Simulate Proctoring Events
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // reduced frequency
        const events = [
          "Gaze deviation detected (3s)",
          "Background noise detected",
          "Face partially obscured"
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        setProctorFlags(prev => [event, ...prev].slice(0, 3));
        addNotification("warning", `Proctor Alert: ${event}`);
      }
    }, 5000);

    // Auto-save interval (every 30 seconds)
    const saveInterval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, codeRef.current);
      setLastSaved(new Date());
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(saveInterval);
    };
  }, []);

  const handleRunCode = () => {
    setStatus("RUNNING");
    setOutput("Sending submission to Execution Service...\nAllocating Docker container...\n");
    
    // Simulate Async Execution Service
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setStatus("SUCCESS");
        setOutput(prev => prev + "Running tests...\n\nTest Case 1: [2, 7, 11, 15], 9 -> PASS\nTest Case 2: [3, 2, 4], 6 -> PASS\nTest Case 3: [3, 3], 6 -> PASS\n\nAll Test Cases Passed! (Runtime: 2ms)");
        addNotification("success", "All test cases passed!");
      } else {
        setStatus("FAILED");
        setOutput(prev => prev + "Running tests...\n\nTest Case 1: [2, 7, 11, 15], 9 -> PASS\nTest Case 2: [3, 2, 4], 6 -> FAIL\n   Expected: [1, 2]\n   Actual: [0, 1]");
        addNotification("error", "Some test cases failed.");
      }
    }, 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Exam Header */}
      <div className={`h-14 border-b px-4 flex items-center justify-between transition-colors ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">CS101: Data Structures</span>
          <span className="text-slate-400">|</span>
          <span className="text-sm text-slate-400">Final Exam</span>
        </div>
        <div className="flex items-center gap-6">
          {lastSaved && (
            <div className="text-xs text-slate-400 flex items-center gap-1 animate-pulse-subtle">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full hover:bg-opacity-20 transition-all ${isDark ? 'hover:bg-white text-slate-400 hover:text-white' : 'hover:bg-black text-slate-500 hover:text-slate-900'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex items-center gap-2 text-amber-500">
             <Clock size={18} />
             <span className="font-mono font-bold">01:45:22</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded text-sm font-semibold transition-colors text-white shadow-lg shadow-blue-500/30">
            Submit Exam
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Description */}
        <div className={`w-1/3 border-r overflow-y-auto p-6 transition-colors ${
          isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-900 border-slate-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold">{MOCK_QUESTION.title}</h2>
             <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
               {MOCK_QUESTION.difficulty}
             </span>
          </div>
          <div className={`prose prose-sm max-w-none mb-8 ${isDark ? 'prose-invert' : 'prose-slate'}`}>
            <p className="whitespace-pre-wrap">{MOCK_QUESTION.description}</p>
          </div>

          <div className={`p-4 rounded-lg border transition-colors ${
            isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-blue-50 border-blue-100'
          }`}>
             <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>Examples</h3>
             <pre className={`text-xs p-3 rounded border overflow-x-auto font-mono ${
               isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-blue-100 text-slate-700'
             }`}>
               Input: nums = [2,7,11,15], target = 9{"\n"}
               Output: [0,1]{"\n"}
               Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
             </pre>
          </div>
        </div>

        {/* Center: Code Editor */}
        <div className={`flex-1 flex flex-col transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
          <div className={`h-10 flex items-center px-4 border-b transition-colors ${
            isDark ? 'bg-[#252526] border-[#333]' : 'bg-slate-100 border-slate-200'
          }`}>
             <span className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               Solution.java
             </span>
          </div>
          
          <div className="flex-1 w-full relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              value={code}
              theme={isDark ? "vs-dark" : "light"}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className={`h-48 border-t flex flex-col transition-colors ${
            isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`h-8 px-4 flex items-center justify-between transition-colors ${
              isDark ? 'bg-[#252526]' : 'bg-slate-100'
            }`}>
              <span className="text-xs font-bold text-slate-400 uppercase">Console Output</span>
              <div className="flex gap-2">
                 <button className="text-xs text-slate-400 hover:text-slate-500">Clear</button>
              </div>
            </div>
            <pre className={`flex-1 p-4 font-mono text-xs overflow-auto ${
              status === "SUCCESS" ? "text-emerald-500" : status === "FAILED" ? "text-red-500" : (isDark ? "text-slate-400" : "text-slate-600")
            }`}>
              {output || "Ready to execute..."}
            </pre>
          </div>
          <div className={`p-3 border-t flex justify-end gap-3 transition-colors ${
            isDark ? 'bg-[#252526] border-[#333]' : 'bg-white border-slate-200'
          }`}>
             <button 
               onClick={() => { setStatus("IDLE"); setOutput(""); }}
               className={`px-4 py-2 rounded text-sm transition-colors ${
                 isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
               }`}
             >
               Reset
             </button>
             <button 
               onClick={handleRunCode}
               disabled={status === "RUNNING"}
               className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
             >
               {status === "RUNNING" ? <Activity className="animate-spin" size={16} /> : <Play size={16} />}
               Run Code
             </button>
          </div>
        </div>

        {/* Right: Proctoring & Info */}
        <div className={`w-64 border-l flex flex-col transition-colors ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
           <div className={`p-3 border-b transition-colors ${
             isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
           }`}>
             <div className="flex items-center gap-2 text-slate-500 mb-2">
               <Shield size={16} className="text-emerald-500" />
               <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Proctoring Active</span>
             </div>
             <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-600">
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-80" />
               <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
               <div className="absolute bottom-1 left-1 bg-black/50 px-1 rounded text-[10px] text-white">
                 REC
               </div>
             </div>
           </div>

           <div className="flex-1 p-4 overflow-y-auto">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Integrity Log</h4>
             <div className="space-y-3">
                {proctorFlags.map((flag, idx) => (
                  <div key={idx} className={`p-2 rounded border-l-2 border-amber-500 text-xs transition-colors ${
                    isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-white border text-slate-700 shadow-sm'
                  }`}>
                     <div className="flex items-center gap-1 mb-1 text-amber-500">
                       <AlertTriangle size={10} />
                       <span className="font-bold">Flag Raised</span>
                     </div>
                     {flag}
                  </div>
                ))}
                <div className="text-xs text-slate-500 italic text-center mt-4">
                  AI Monitoring Active...
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const CreateExamModal = ({ onClose }: { onClose: () => void }) => {
  const { addNotification } = useContext(NotificationContext);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification("success", "Exam 'Midterm 2024' created successfully!");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Create New Assessment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. CS101 Final Exam" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option>CS101 - Intro to CS</option>
                <option>CS302 - Algorithms</option>
                <option>SE401 - Software Eng.</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={60} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Configuration</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                <span className="text-sm text-slate-600">Enable AI Proctoring</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                <span className="text-sm text-slate-600">Randomize Questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-slate-600">Allow Code Compilation</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Create Exam</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const InstructorDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 relative">
      {showCreateModal && <CreateExamModal onClose={() => setShowCreateModal(false)} />}
      
       <div className="flex justify-between items-end mb-8">
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
           <p className="text-slate-500">Manage courses and monitor active exams</p>
         </div>
         <button 
           onClick={() => setShowCreateModal(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
         >
           <Plus size={16} />
           Create New Exam
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Users size={20} />
                </div>
                <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">+12%</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">482</h3>
             <p className="text-slate-500 text-sm">Active Students</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <span className="text-slate-400 text-xs">This Semester</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">24</h3>
             <p className="text-slate-500 text-sm">Published Assignments</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">High</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">18</h3>
             <p className="text-slate-500 text-sm">Proctoring Alerts (Today)</p>
          </div>
       </div>

       <h2 className="text-lg font-bold text-slate-800 mb-4">Active Exams</h2>
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4">Exam Title</th>
                 <th className="px-6 py-4">Course</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Completion</th>
                 <th className="px-6 py-4">Integrity Score</th>
                 <th className="px-6 py-4">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               <tr className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-900">Final: Data Structures</td>
                 <td className="px-6 py-4 text-slate-500">CS101</td>
                 <td className="px-6 py-4">
                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                     Live
                   </span>
                 </td>
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <div className="w-24 bg-slate-100 rounded-full h-2">
                       <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                     </div>
                     <span className="text-xs text-slate-500">65%</span>
                   </div>
                 </td>
                 <td className="px-6 py-4 text-slate-700">98.2%</td>
                 <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Monitor</button>
                 </td>
               </tr>
               <tr className="hover:bg-slate-50">
                 <td className="px-6 py-4 font-medium text-slate-900">Quiz 3: Algorithms</td>
                 <td className="px-6 py-4 text-slate-500">CS302</td>
                 <td className="px-6 py-4">
                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                     Ended
                   </span>
                 </td>
                 <td className="px-6 py-4 text-slate-500">100%</td>
                 <td className="px-6 py-4 text-slate-700">95.4%</td>
                 <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Results</button>
                 </td>
               </tr>
             </tbody>
          </table>
       </div>
    </div>
  );
};

// --- Main Layout & App ---

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === "STUDENT" ? "dashboard" : "dashboard"); // reset tab
    addNotification("info", `Welcome back, ${user.name}`);
  }

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
    addNotification("info", "Logged out successfully");
  }

  // Determine which view to show based on Role and active tab
  const renderView = () => {
    if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

    if (currentUser.role === "STUDENT") {
      if (activeTab === "exam") return <StudentExamInterface />;
      return (
        <div className="p-12 text-center h-full flex flex-col items-center justify-center">
          <div className="max-w-md w-full">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome, {currentUser.name}</h2>
            <p className="text-slate-500 mb-8">You have an upcoming exam starting in 10 minutes.</p>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left mb-8">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-lg text-slate-900">CS101 Final Exam</h3>
                   <p className="text-sm text-slate-500">Prof. Sarah Jenkins</p>
                 </div>
                 <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold">Starts Soon</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-2"><Clock size={16} /> 60 Minutes</div>
                <div className="flex items-center gap-2"><Code size={16} /> 2 Coding Problems</div>
                <div className="flex items-center gap-2"><Shield size={16} /> Proctoring Enabled</div>
              </div>
              <button 
                onClick={() => setActiveTab("exam")}
                className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                Enter Exam Lobby <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (currentUser.role === "INSTRUCTOR") {
      if (activeTab === "courses") return <div className="p-8 text-slate-500">Courses View (Placeholder)</div>;
      return <InstructorDashboard />;
    }

    if (currentUser.role === "ADMIN") {
      if (activeTab === "users") return <UserManagement />;
      return <AdminDashboard />;
    }
  };

  if (!currentUser) {
    return (
      <NotificationContext.Provider value={{ addNotification }}>
         <LoginScreen onLogin={handleLogin} />
      </NotificationContext.Provider>
    );
  }

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <div className="flex h-screen w-screen bg-slate-50">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
           {notifications.map(n => (
             <div key={n.id} className={`min-w-[300px] p-4 rounded-lg shadow-lg border-l-4 text-sm font-medium animate-in slide-in-from-right fade-in duration-300 ${
               n.type === 'success' ? 'bg-white border-emerald-500 text-emerald-700' :
               n.type === 'error' ? 'bg-white border-red-500 text-red-700' :
               n.type === 'warning' ? 'bg-white border-amber-500 text-amber-700' :
               'bg-slate-800 border-slate-600 text-white'
             }`}>
               {n.message}
             </div>
           ))}
        </div>

        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-20">
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/50">U</div>
             <span className="hidden lg:block ml-3 font-bold text-white text-lg tracking-tight">UniScale</span>
          </div>

          <nav className="flex-1 py-6 space-y-2 px-3">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                activeTab === "dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="hidden lg:block font-medium">Dashboard</span>
            </button>
            
            {currentUser.role !== "STUDENT" && (
              <button 
                 onClick={() => setActiveTab("courses")}
                 className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                   activeTab === "courses" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"
                 }`}
              >
                <BookOpen size={20} />
                <span className="hidden lg:block font-medium">Courses</span>
              </button>
            )}

            {currentUser.role === "STUDENT" && (
              <button 
                onClick={() => setActiveTab("exam")}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  activeTab === "exam" ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Code size={20} />
                <span className="hidden lg:block font-medium">My Exams</span>
              </button>
            )}

            {currentUser.role === "ADMIN" && (
              <button 
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  activeTab === "users" ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Users size={20} />
                <span className="hidden lg:block font-medium">Users</span>
              </button>
            )}
          </nav>

          {/* User Profile / Role Switcher */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 mb-4">
               <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700" />
               <div className="hidden lg:block overflow-hidden">
                 <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{currentUser.role}</p>
               </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-wider"
            >
               <LogOut size={14} />
               <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          {renderView()}
        </main>
      </div>
    </NotificationContext.Provider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}