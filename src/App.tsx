import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building2, 
  ChevronRight, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  Calendar, 
  Wallet, 
  AlertTriangle, 
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Shield,
  Clock,
  Briefcase,
  Verified,
  QrCode
} from 'lucide-react';
import * as emailjs from '@emailjs/browser';

// --- Constants ---
const ADMIN_CODES = {
  "Harsh":   "WG-H7X2#9KP",
  "Abhay":   "WG-A4N8@3QZ",
  "Aman":    "WG-M6T1$5RV",
  "Ajay":    "WG-J9W3%2LY",
  "Tarun":   "WG-T5B7!8MF",
  "Karthik": "WG-K2D4^6NE"
};

const CRYPTO_COINS = ["Bitcoin (BTC)", "Ethereum (ETH)", "Litecoin (LTC)", "USDT"];
const CRYPTO_NETWORKS = ["BTC Network", "ERC-20", "TRC-20", "BEP-20"];

// --- Components ---

/**
 * Particle Network Canvas Background
 */
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let orbs: Orb[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
        const colors = ['#00e5ff', '#7c3aed', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.fill();
      }
    }

    class Orb {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = 40 + Math.random() * 60;
        this.color = Math.random() > 0.5 ? '#00e5ff11' : '#7c3aed11';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        const gradient = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 180 }, () => new Particle());
      orbs = Array.from({ length: 5 }, () => new Orb());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      orbs.forEach(orb => {
        orb.update();
        orb.draw();
      });

      particles.forEach((p, i) => {
        p.update();
        p.draw();
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 * (1 - dist / 85)})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    admin: '',
    adminCode: '',
    numDays: '',
    accPerDay: '',
    payMethod: '',
    upiId: '',
    walletAddress: '',
    cryptoCoin: '',
    cryptoNetwork: '',
    agreed: false
  });

  const [codeStatus, setCodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earningsPopping, setEarningsPopping] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));

    if (name === 'adminCode') {
      const selectedAdmin = formData.admin as keyof typeof ADMIN_CODES;
      if (selectedAdmin && ADMIN_CODES[selectedAdmin] === value) {
        setCodeStatus('success');
      } else {
        setCodeStatus(value ? 'error' : 'idle');
      }
    }

    if (name === 'numDays' || name === 'accPerDay') {
      setEarningsPopping(true);
      setTimeout(() => setEarningsPopping(false), 300);
    }
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, admin: e.target.value, adminCode: '' }));
    setCodeStatus('idle');
  };

  const calculateEarnings = useMemo(() => {
    const days = parseInt(formData.numDays) || 0;
    const accs = parseInt(formData.accPerDay) || 0;
    const totalAccs = days * accs;
    const earnings = totalAccs * 12;
    return { totalAccs, earnings };
  }, [formData.numDays, formData.accPerDay]);

  const steps = [
    { name: 'Profile', complete: !!(formData.fullName && formData.email && formData.phone) },
    { name: 'Admin', complete: !!(formData.admin && codeStatus === 'success') },
    { name: 'Schedule', complete: !!(formData.numDays && formData.accPerDay) },
    { name: 'Payment', complete: !!(formData.payMethod && (formData.payMethod === 'upi' ? formData.upiId : formData.walletAddress)) }
  ];

  const currentStepIndex = steps.findIndex(s => !s.complete);
  const activeStep = currentStepIndex === -1 ? 4 : currentStepIndex;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 25;
    const rotateY = (x - centerX) / 25;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed || codeStatus !== 'success') return;

    setIsSubmitting(true);
    
    const params = {
      worker_name: formData.fullName,
      worker_email: formData.email,
      worker_phone: formData.phone,
      admin_name: formData.admin,
      num_days: formData.numDays,
      acc_per_day: formData.accPerDay,
      total_accounts: calculateEarnings.totalAccs,
      total_earnings: `₹${calculateEarnings.earnings.toFixed(2)}`,
      payment_info: formData.payMethod === 'upi' ? `UPI: ${formData.upiId}` : `Crypto (${formData.cryptoCoin} - ${formData.cryptoNetwork}): ${formData.walletAddress}`,
      submit_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      subject: `[WorkGrid] New Worker Registration — ${formData.fullName}`,
      to_email: 'harseettiwary70@gmail.com',
      to_name: 'Harseet Tiwary'
    };

    try {
      emailjs.init('DAX4-xm08TcLFTT_K');
      await emailjs.send('service_2k0sytn', 'template_629k0gp', params);
    } catch (err) {
      console.error("EmailJS Error:", err);
    } finally {
      setIsSubmitting(false);
      setShowSuccess(true);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', email: '', phone: '',
      admin: '', adminCode: '',
      numDays: '', accPerDay: '',
      payMethod: '', upiId: '', walletAddress: '',
      cryptoCoin: '', cryptoNetwork: '',
      agreed: false
    });
    setCodeStatus('idle');
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen relative selection:bg-cyan-500/30">
      <ParticleBackground />
      <div className="noise-overlay" />
      <div className="grid-overlay fixed inset-0 z-0" />

      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 animate-fadeDown">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00e5ff] to-[#7c3aed] flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              W
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              WorkGrid <span className="text-[#00e5ff]">Pro</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Support'].map(item => (
              <a key={item} href="#" className="text-sm font-medium text-white/60 hover:text-[#00e5ff] transition-colors">{item}</a>
            ))}
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-livePulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00e5ff]">Portal v3.0</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
        {/* --- Hero --- */}
        <div className="text-center mb-12 animate-fadeDown">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
            Start Earning With <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]">
              WorkGrid Today
            </span>
          </h1>
          <p className="text-white/40 max-w-lg mx-auto mb-8 font-light leading-relaxed">
            Join our verified workforce. Complete your profile, select your admin, 
            and begin earning ₹12 per account — paid weekly.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '₹12 Per Account', icon: ShieldCheck },
              { label: '7 Days Pay Cycle', icon: Clock },
              { label: '6 Active Admins', icon: Building2 },
              { label: '100% Verified', icon: Verified }
            ].map((stat, i) => (
              <div key={i} className="glass p-4 rounded-2xl flex flex-col items-center gap-2 border-white/5 hover:border-[#00e5ff/20 transition-all group">
                <stat.icon size={20} className="text-[#00e5ff] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-mono text-white/60 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Progress Bar --- */}
        <div className="mb-12 hidden md:block animate-fadeDown" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center px-4">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  step.complete 
                    ? 'bg-[#10b981] border-[#10b981] shadow-[0_0_15px_#10b98166]' 
                    : i === activeStep 
                    ? 'border-[#00e5ff] text-[#00e5ff] shadow-[0_0_15px_#00e5ff44]' 
                    : 'border-white/10 text-white/20'
                }`}>
                  {step.complete ? <CheckCircle2 size={20} /> : <span className="font-mono">{i + 1}</span>}
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-widest ${
                  step.complete ? 'text-[#10b981]' : i === activeStep ? 'text-[#00e5ff]' : 'text-white/20'
                }`}>{step.name}</span>
              </div>
            ))}
            <div className="absolute top-[20px] left-0 right-0 h-[2px] bg-white/5 -z-0 mx-10">
              <div 
                className="h-full bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] transition-all duration-700"
                style={{ width: `${(activeStep / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* --- Form Card --- */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="glass rounded-[32px] neon-border-top p-8 md:p-12 transition-transform duration-200 ease-out animate-fadeUp relative overflow-hidden group shadow-2xl"
        >
          {/* Accent glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#00e5ff11] blur-[100px] rounded-full group-hover:bg-[#00e5ff18] transition-colors" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#7c3aed11] blur-[100px] rounded-full group-hover:bg-[#7c3aed18] transition-colors" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
            
            {/* SECTION 01 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00e5ff22] flex items-center justify-center text-[#00e5ff]">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-[.2em]">Section 01</div>
                  <h3 className="text-xl font-bold">Personal Information</h3>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-4" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/40 block">Full Name</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter legal name"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all placeholder:text-white/10"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/40 block">Email Address</label>
                    <input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="email@example.com"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/40 block">Phone Number</label>
                    <input 
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+91"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 02 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00e5ff22] flex items-center justify-center text-[#00e5ff]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-[.2em]">Section 02</div>
                  <h3 className="text-xl font-bold">Admin Assignment</h3>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-4" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/40 block">Select Working Admin</label>
                  <select 
                    name="admin"
                    value={formData.admin}
                    onChange={handleAdminChange}
                    required
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#060d1f]">-- Choose Provider --</option>
                    {Object.keys(ADMIN_CODES).map(admin => (
                      <option key={admin} value={admin} className="bg-[#060d1f]">{admin}</option>
                    ))}
                  </select>
                </div>

                {formData.admin && (
                  <div className="space-y-4 animate-fadeDown">
                    <div className="p-4 rounded-xl bg-[#00e5ff0d] border border-[#00e5ff22] flex gap-4">
                      <AlertTriangle className="text-[#00e5ff] shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-medium text-[#00e5ff]">Verification Required</p>
                        <p className="text-xs text-white/40 leading-relaxed">
                          Enter the verification code provided by your admin <span className="text-white/60">({formData.admin})</span> via WhatsApp to authorize this profile.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-white/40 block">Admin Verification Code</label>
                      <input 
                        name="adminCode"
                        value={formData.adminCode}
                        onChange={handleInputChange}
                        required
                        placeholder="WG-XXXXX-XXXX"
                        className={`w-full h-12 bg-white/5 border rounded-xl px-6 focus:outline-none transition-all placeholder:text-white/10 ${
                          codeStatus === 'success' ? 'border-[#10b981]' : codeStatus === 'error' ? 'border-[#f43f5e]' : 'border-white/10 focus:border-[#00e5ff]'
                        }`}
                      />
                      {codeStatus === 'success' && <p className="text-[10px] text-[#10b981] font-mono uppercase tracking-wider">✓ Code verified successfully</p>}
                      {codeStatus === 'error' && <p className="text-[10px] text-[#f43f5e] font-mono uppercase tracking-wider">✗ Invalid code — check with your admin</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 03 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00e5ff22] flex items-center justify-center text-[#00e5ff]">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-[.2em]">Section 03</div>
                  <h3 className="text-xl font-bold">Work Schedule</h3>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-4" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/40 block">Number of Days</label>
                  <input 
                    name="numDays"
                    type="number"
                    value={formData.numDays}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Working days"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/40 block">Accounts Per Day</label>
                  <input 
                    name="accPerDay"
                    type="number"
                    value={formData.accPerDay}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Volume target"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Earnings Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] blur-[20px] opacity-10 group-hover:opacity-20 transition-opacity rounded-[24px]" />
                <div className="relative glass p-6 rounded-[24px] border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00e5ff] to-transparent opacity-5 animate-spin-slow" />
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-[.2em]">Real-time Estimation</span>
                    <div className="px-2 py-0.5 rounded-md bg-[#10b98122] text-[#10b981] text-[9px] font-bold uppercase tracking-widest">Rate Locked ₹12.00</div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-1">
                      <div className="text-xs text-white/40 flex items-center gap-2">
                        <Clock size={12} />
                        Cycle: Every 7 Calendar Days
                      </div>
                      <div className="text-xs text-white/40">Total Accounts: <span className="text-white">{calculateEarnings.totalAccs} Units</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Total Estimated Earnings</div>
                      <div className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] ${earningsPopping ? 'animate-numPop' : ''}`}>
                        ₹{calculateEarnings.earnings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 04 */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#00e5ff22] flex items-center justify-center text-[#00e5ff]">
                  <Wallet size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-[.2em]">Section 04</div>
                  <h3 className="text-xl font-bold">Payment Setup</h3>
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-4" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/40 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, payMethod: 'upi' }))}
                      className={`h-14 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                        formData.payMethod === 'upi' ? 'bg-[#00e5ff11] border-[#00e5ff] text-[#00e5ff]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      <QrCode size={18} />
                      <span className="font-medium">UPI ID</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, payMethod: 'crypto' }))}
                      className={`h-14 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                        formData.payMethod === 'crypto' ? 'bg-[#7c3aed11] border-[#7c3aed] text-[#7c3aed]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-current" />
                      <span className="font-medium">Crypto</span>
                    </button>
                  </div>
                </div>

                {formData.payMethod === 'upi' && (
                  <div className="space-y-4 animate-fadeDown">
                    <div className="space-y-2">
                      <label className="text-sm text-white/40 block">UPI Identifier</label>
                      <input 
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        placeholder="username@bankhost"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#00e5ff] focus:outline-none transition-all placeholder:text-white/10"
                      />
                    </div>
                    <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:border-[#00e5ff44] transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#00e5ff] transition-colors">
                        <QrCode size={20} />
                      </div>
                      <p className="text-xs text-white/20">Upload Merchant QR Code (PNG/JPG)</p>
                    </div>
                  </div>
                )}

                {formData.payMethod === 'crypto' && (
                  <div className="space-y-4 animate-fadeDown">
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        name="cryptoCoin"
                        value={formData.cryptoCoin}
                        onChange={handleInputChange}
                        className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:border-[#7c3aed] focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Coin</option>
                        {CRYPTO_COINS.map(c => <option key={c} value={c} className="bg-[#060d1f]">{c}</option>)}
                      </select>
                      <select 
                        name="cryptoNetwork"
                        value={formData.cryptoNetwork}
                        onChange={handleInputChange}
                        className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:border-[#7c3aed] focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Network</option>
                        {CRYPTO_NETWORKS.map(n => <option key={n} value={n} className="bg-[#060d1f]">{n}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/40 block">Wallet Recipient Address</label>
                      <input 
                        name="walletAddress"
                        value={formData.walletAddress}
                        onChange={handleInputChange}
                        placeholder="0x... or Address String"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-6 focus:border-[#7c3aed] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer & Submit */}
            <div className="pt-6 space-y-6">
              <div className="p-5 rounded-2xl border border-[#f43f5e22] bg-[#f43f5e08] space-y-3">
                <div className="flex items-center gap-2 text-[#f43f5e]">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Terms & Payment Policy</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Payments are processed on a weekly cycle (every 7 calendar days). 
                  Missing even a single working day may result in a proportional reduction 
                  of your weekly payout. Ensure all details are accurate to avoid delays.
                </p>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    formData.agreed ? 'bg-[#f43f5e] border-[#f43f5e]' : 'border-white/20 group-hover:border-[#f43f5e/50'
                  }`}>
                    <input 
                      type="checkbox"
                      name="agreed"
                      checked={formData.agreed}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    {formData.agreed && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                    I have read, understood, and agree to the WorkGrid payment policy.
                  </span>
                </label>
              </div>

              <button 
                type="submit"
                disabled={!formData.agreed || isSubmitting || codeStatus !== 'success'}
                className="w-full h-16 rounded-2xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] via-[#7c3aed] to-[#00e5ff] animate-gradShift" />
                <div className="absolute inset-[1px] bg-[#030712] rounded-[15px] group-hover:bg-[#030712]/80 transition-colors" />
                <div className="relative flex items-center justify-center gap-3 text-white font-bold tracking-widest text-sm uppercase">
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Submit Registration'}
                </div>
                <div className="absolute inset-0 bg-[#00e5ff11] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </form>

          {/* Trust Bar */}
          <div className="mt-12 flex flex-wrap justify-between gap-6 pt-8 border-t border-white/5">
            {[
              { label: 'SSL Encrypted', icon: Shield },
              { label: 'Verified Platform', icon: Verified },
              { label: 'Weekly Payouts', icon: Wallet },
              { label: 'Data Protected', icon: ShieldCheck }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <item.icon size={12} className="text-[#00e5ff]" />
                <span className="text-[10px] font-mono uppercase tracking-[.2em]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 grayscale opacity-60">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">W</div>
              <span className="text-lg font-bold">WorkGrid</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed font-light">
              Premium workforce orchestration and deployment infrastructure for modern enterprises.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-white tracking-[.2em] uppercase mb-6">Portal Map</h4>
            <div className="space-y-3 flex flex-col">
              {['Home', 'About Us', 'Verified Workforce', 'Admin Portal'].map(t => (
                <a key={t} href="#" className="text-xs text-white/30 hover:text-[#00e5ff] transition-colors">{t}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-white tracking-[.2em] uppercase mb-6">Legal & Security</h4>
            <div className="space-y-3 flex flex-col">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security Audit'].map(t => (
                <a key={t} href="#" className="text-xs text-white/30 hover:text-[#00e5ff] transition-colors">{t}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-white tracking-[.2em] uppercase mb-6">Support</h4>
            <div className="space-y-3 flex flex-col">
              {['Help Center', 'Admin Verification', 'Payment Issues', 'WhatsApp Contact'].map(t => (
                <a key={t} href="#" className="text-xs text-white/30 hover:text-[#00e5ff] transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-[.3em]">
          <span>© 2025 WorkGrid Technologies Pvt. Ltd.</span>
          <span>All Rights Reserved — Secure Session</span>
        </div>
      </footer>

      {/* --- Success Screen --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#030712fd] backdrop-blur-xl" />
          
          <div className="relative w-full max-w-xl animate-sucPop">
            <div className="glass rounded-[32px] p-8 md:p-12 text-center border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10b981] to-[#00e5ff]" />
              
              {/* Circular Animation */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border border-[#10b98144] animate-ringOut" />
                <div className="absolute inset-0 rounded-full border border-[#10b98122] animate-ringOut" style={{ animationDelay: '0.5s' }} />
                <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-tr from-[#10b981] to-[#00e5ff] flex items-center justify-center text-white shadow-[0_0_40px_#10b98166] animate-checkIn">
                  <CheckCircle2 size={56} strokeWidth={1.5} />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b98122] text-[#10b981] text-[9px] font-bold uppercase tracking-widest mb-6 border border-[#10b98144]">
                <Verified size={10} />
                Submitted Successfully
              </div>

              <h2 className="text-3xl font-bold mb-2">Thank You for Submitting! 🎉</h2>
              <p className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] mb-8">
                Welcome to WorkGrid
              </p>

              <div className="space-y-6 text-left max-w-sm mx-auto">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-mono">Message Your Admin</p>
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-[0_0_15px_#25D36644] group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#25D366]">Contact Admin on WhatsApp</h4>
                      <p className="text-[10px] text-white/30">They will provide tasks within 24h</p>
                    </div>
                    <ExternalLink size={14} className="ml-auto text-white/20" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { t: 'Registration Complete', d: '✓ profile submitted', active: true },
                    { t: 'WhatsApp Verification', d: 'pending admin contact', active: false },
                    { t: 'Begin Working', d: 'earn ₹12/account', active: false }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-[#10b981] animate-pulse' : 'bg-white/10'}`} />
                      <div>
                        <div className={`text-xs font-bold leading-none ${step.active ? 'text-white' : 'text-white/20'}`}>{step.t}</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1 font-mono">{step.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#10b9810d] border border-[#10b98122]">
                  <p className="text-[10px] text-[#10b981] leading-relaxed">
                    <span className="font-bold">TIP:</span> Save your admin's WhatsApp number and mention your registered email for faster onboarding.
                  </p>
                </div>

                <button 
                  onClick={resetForm}
                  className="w-full h-12 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Back to Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
