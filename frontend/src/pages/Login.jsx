import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile, getProfile } from '../db';

export default function Login() {
  const navigate = useNavigate();

  // Auth modes: 'login' or 'register'
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoAdminLogin = () => {
    setErrorMsg('');
    setEmail('hardik@university.edu');
    setPassword('password123');
    
    // Simulate short network delay
    setIsLoading(true);
    setTimeout(() => {
      const adminProfile = {
        name: "Hardik",
        major: "Computer Science",
        year: "4th Year",
        email: "hardik@university.edu",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwozUBToAeWm6qEAFt4XpKTKQvJVko-_u9NhR9mUQpKXAy9c2payVVkBjnDI90kfoyEki07Rro02oX02iytGaoYmn0Ej6DETSil0VE-Sj6nJvg-XP4YKXjRAGkTobHlnEdMM4TrFNLy0A4XvQRDVpYGl84ocnA5aZlpNMwbgvfrZHLbCMcm67T2pPU0f0f9uyuE0o5WKpFxjI0NjyUv7POLY5Y55bEfr5Z4yzT5hTi0B419ePRJori6c39wesX8XLchKTKxUxWGXdM",
        rating: 4.9,
        rank: 12,
        points: 1540,
        listingsCount: 4,
        salesCount: 8,
        purchasedCount: 14,
        isAdmin: true
      };
      saveProfile(adminProfile);
      localStorage.setItem('is_logged_in', 'true');
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('profileChanged'));
      setIsLoading(false);
      navigate('/marketplace');
    }, 600);
  };

  const handleDemoUserLogin = () => {
    setErrorMsg('');
    setEmail('student@university.edu');
    setPassword('password123');
    
    // Simulate short network delay
    setIsLoading(true);
    setTimeout(() => {
      const userProfile = {
        name: "Aarav Sharma",
        major: "Mechanical Engineering",
        year: "2nd Year",
        email: "student@university.edu",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
        rating: 4.8,
        rank: 45,
        points: 320,
        listingsCount: 1,
        salesCount: 2,
        purchasedCount: 5,
        isAdmin: false
      };
      saveProfile(userProfile);
      localStorage.setItem('is_logged_in', 'true');
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('profileChanged'));
      setIsLoading(false);
      navigate('/marketplace');
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    // Strict .edu check for student community aspect
    if (!email.toLowerCase().endsWith('.edu')) {
      setErrorMsg('Access restricted. A valid university .edu email is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Simulate mock login api delay
    setTimeout(() => {
      if (mode === 'login') {
        // Mock authentication success
        const currentProfile = getProfile();
        const isDemoAdmin = email.toLowerCase().trim() === 'hardik@university.edu';
        const isDemoUser = email.toLowerCase().trim() === 'student@university.edu';
        
        let updatedProfile = {
          ...currentProfile,
          email: email.toLowerCase().trim(),
          isAdmin: isDemoAdmin
        };
        
        if (isDemoAdmin) {
          updatedProfile = {
            ...updatedProfile,
            name: "Hardik",
            major: "Computer Science",
            year: "4th Year",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwozUBToAeWm6qEAFt4XpKTKQvJVko-_u9NhR9mUQpKXAy9c2payVVkBjnDI90kfoyEki07Rro02oX02iytGaoYmn0Ej6DETSil0VE-Sj6nJvg-XP4YKXjRAGkTobHlnEdMM4TrFNLy0A4XvQRDVpYGl84ocnA5aZlpNMwbgvfrZHLbCMcm67T2pPU0f0f9uyuE0o5WKpFxjI0NjyUv7POLY5Y55bEfr5Z4yzT5hTi0B419ePRJori6c39wesX8XLchKTKxUxWGXdM",
            rating: 4.9,
            rank: 12,
            points: 1540,
            listingsCount: 4,
            salesCount: 8,
            purchasedCount: 14,
            isAdmin: true
          };
        } else if (isDemoUser) {
          updatedProfile = {
            ...updatedProfile,
            name: "Aarav Sharma",
            major: "Mechanical Engineering",
            year: "2nd Year",
            avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
            rating: 4.8,
            rank: 45,
            points: 320,
            listingsCount: 1,
            salesCount: 2,
            purchasedCount: 5,
            isAdmin: false
          };
        }
        
        saveProfile(updatedProfile);
        localStorage.setItem('is_logged_in', 'true');
        window.dispatchEvent(new Event('authChanged'));
        window.dispatchEvent(new Event('profileChanged'));
        setIsLoading(false);
        navigate('/marketplace');
      } else {
        // Register flow: Save new credentials
        const newProfile = {
          name: name.trim() || 'Student Trader',
          major: major.trim() || 'Undecided',
          year: year.trim() || 'First Year',
          email: email.toLowerCase().trim(),
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'default')}`,
          rating: 5.0,
          rank: 99,
          points: 100,
          listingsCount: 0,
          salesCount: 0,
          purchasedCount: 0,
          isAdmin: false
        };

        saveProfile(newProfile);
        localStorage.setItem('is_logged_in', 'true');
        window.dispatchEvent(new Event('authChanged'));
        window.dispatchEvent(new Event('profileChanged'));
        setIsLoading(false);
        navigate('/marketplace');
      }
    }, 1000);
  };

  return (
    <div className="bg-surface-container-low min-h-screen relative overflow-x-hidden flex items-center justify-center py-20 px-4">
      {/* Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-secondary/15 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center gap-xs mb-8 text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg ring-4 ring-primary-container/20">
            <span className="material-symbols-outlined text-[36px] icon-fill">storefront</span>
          </div>
          <h1 className="font-display text-3xl font-black text-on-surface tracking-tight mt-3">
            CampusMarket
          </h1>
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-bold">
            Premium Student Trading
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card rounded-2xl p-lg shadow-2xl flex flex-col gap-lg transition-all border border-outline-variant/30 relative">
          {/* Tab Switcher */}
          <div className="bg-surface-container-low p-1 rounded-xl flex gap-1">
            <button 
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 rounded-lg py-2.5 font-label-md text-label-md text-center transition-all border-0 cursor-pointer ${mode === 'login' ? 'bg-surface shadow-md text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 rounded-lg py-2.5 font-label-md text-label-md text-center transition-all border-0 cursor-pointer ${mode === 'register' ? 'bg-surface shadow-md text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="bg-error-container/20 border border-error/20 text-error px-md py-3 rounded-xl flex items-center gap-sm font-body-md text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">Full Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Hardik Derashri"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">Branch / Major</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">Year</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Sophomore, Junior, 3rd Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">University Email Address</label>
              <input 
                required
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-md pr-12 py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors border-0 bg-transparent cursor-pointer p-0 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">Confirm Password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-md pr-12 py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => alert("Mock password reset link sent to your university email!")}
                  className="text-primary font-label-sm text-label-sm hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary hover:bg-primary/95 font-label-md text-label-md py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg font-bold text-center active:scale-95 duration-100 cursor-pointer border-0 mt-6 flex justify-center items-center gap-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-outline-variant/35"></div>
                <span className="flex-shrink mx-4 text-outline font-label-sm text-xs font-semibold uppercase tracking-wider">Demo Access</span>
                <div className="flex-grow border-t border-outline-variant/35"></div>
              </div>

              {/* Quick Login Assist Cards */}
              <div className="flex flex-col gap-sm">
                {/* Admin Card */}
                <div 
                  onClick={handleDemoAdminLogin}
                  className="bg-primary/5 hover:bg-primary/10 border border-primary/20 p-md rounded-xl flex items-center gap-md cursor-pointer transition-all hover:scale-[1.02] duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined icon-fill">admin_panel_settings</span>
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="font-label-md text-xs font-bold text-primary mb-0.5 font-semibold">Demo Admin Account</p>
                    <p className="text-[11px] text-on-surface-variant truncate">hardik@university.edu</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-xl animate-pulse shrink-0">login</span>
                </div>

                {/* User Card */}
                <div 
                  onClick={handleDemoUserLogin}
                  className="bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 p-md rounded-xl flex items-center gap-md cursor-pointer transition-all hover:scale-[1.02] duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined icon-fill">school</span>
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="font-label-md text-xs font-bold text-secondary mb-0.5 font-semibold">Demo User Account</p>
                    <p className="text-[11px] text-on-surface-variant truncate">student@university.edu</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-xl animate-pulse shrink-0">login</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
