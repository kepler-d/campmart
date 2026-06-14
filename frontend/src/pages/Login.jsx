import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, verifyOtp, requestCampus } from '../db';

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

  // OTP State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');

  // Campus Request State
  const [showCampusRequest, setShowCampusRequest] = useState(false);
  const [campusName, setCampusName] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleDemoAdminLogin = () => {
    setErrorMsg('');
    setEmail('hardik@university.edu');
    setPassword('password123');
    
    setIsLoading(true);
    setTimeout(() => {
      loginUser('hardik@university.edu', 'password123').then((data) => {
        if (data.token) localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_email', 'hardik@university.edu');
        localStorage.setItem('is_logged_in', 'true');
        window.dispatchEvent(new Event('authChanged'));
        window.dispatchEvent(new Event('profileChanged'));
        setIsLoading(false);
        navigate('/marketplace');
      }).catch(err => {
        if (err.requiresOtp) setShowOtpScreen(true);
        else setErrorMsg(err.message);
        setIsLoading(false);
      });
    }, 600);
  };

  const handleDemoUserLogin = () => {
    setErrorMsg('');
    setEmail('student@university.edu');
    setPassword('password123');
    
    setIsLoading(true);
    setTimeout(() => {
      loginUser('student@university.edu', 'password123').then((data) => {
        if (data.token) localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_email', 'student@university.edu');
        localStorage.setItem('is_logged_in', 'true');
        window.dispatchEvent(new Event('authChanged'));
        window.dispatchEvent(new Event('profileChanged'));
        setIsLoading(false);
        navigate('/marketplace');
      }).catch(err => {
        if (err.requiresOtp) setShowOtpScreen(true);
        else setErrorMsg(err.message);
        setIsLoading(false);
      });
    }, 600);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await verifyOtp(email.toLowerCase().trim(), otp);
      if (data.token) localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_email', email.toLowerCase().trim());
      localStorage.setItem('is_logged_in', 'true');
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('profileChanged'));
      setIsLoading(false);
      navigate('/marketplace');
    } catch (err) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  const handleCampusRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!campusName.trim()) {
      setErrorMsg('Please provide your institution name.');
      return;
    }

    setIsLoading(true);
    try {
      const domain = '@' + email.toLowerCase().split('@')[1];
      await requestCampus(domain, campusName, email.toLowerCase().trim());
      setRequestSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setErrorMsg(err.message);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials.');
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

    setTimeout(async () => {
      if (mode === 'login') {
        try {
          const data = await loginUser(email.toLowerCase().trim(), password);
          if (data.token) localStorage.setItem('jwt_token', data.token);
          localStorage.setItem('user_email', email.toLowerCase().trim());
          localStorage.setItem('is_logged_in', 'true');
          window.dispatchEvent(new Event('authChanged'));
          window.dispatchEvent(new Event('profileChanged'));
          setIsLoading(false);
          navigate('/marketplace');
        } catch (err) {
          if (err.requiresOtp) {
            setShowOtpScreen(true);
            setErrorMsg('Account not verified. A new OTP has been sent.');
          } else {
            setErrorMsg(err.message);
          }
          setIsLoading(false);
        }
      } else {
        // Register flow
        try {
          const data = await registerUser({
            name: name.trim() || 'Student Trader',
            major: major.trim() || 'Undecided',
            year: year.trim() || 'First Year',
            email: email.toLowerCase().trim(),
            password: password,
            avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name || 'default')}`
          });
          
          if (data.requiresOtp) {
            setShowOtpScreen(true);
            setErrorMsg('Registration successful! Please check your email/terminal for the OTP.');
          } else {
            // Fallback if no OTP required
            if (data.token) localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_email', email.toLowerCase().trim());
            localStorage.setItem('is_logged_in', 'true');
            window.dispatchEvent(new Event('authChanged'));
            window.dispatchEvent(new Event('profileChanged'));
            navigate('/marketplace');
          }
          setIsLoading(false);
        } catch (err) {
          if (err.code === 'domain_not_allowed') {
            setShowCampusRequest(true);
          } else {
            setErrorMsg(err.message);
          }
          setIsLoading(false);
        }
      }
    }, 600);
  };

  if (showOtpScreen) {
    return (
      <div className="bg-surface-container-low min-h-screen relative overflow-x-hidden flex items-center justify-center py-20 px-4">
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="relative z-10 w-full max-w-[420px]">
          <div className="glass-card rounded-2xl p-lg shadow-2xl flex flex-col gap-lg transition-all border border-outline-variant/30 text-center">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Verify Your Account</h2>
            <p className="text-on-surface-variant font-body-md">
              We've sent a 6-digit OTP to your university email. (Check terminal for Ethereal testing link).
            </p>
            {errorMsg && (
              <div className="bg-error-container/20 border border-error/20 text-error px-md py-3 rounded-xl flex items-center gap-sm font-body-md text-sm text-left">
                <span className="material-symbols-outlined text-lg">info</span>
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleOtpSubmit} className="space-y-md text-left">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs font-semibold">Enter OTP</label>
                <input 
                  required
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md font-body-md outline-none focus:border-primary placeholder-outline-variant/60 tracking-widest text-center text-lg font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary hover:bg-primary/95 font-label-md text-label-md py-3.5 rounded-xl transition-all shadow-md font-bold cursor-pointer border-0 mt-6"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                className="w-full mt-2 text-on-surface-variant font-label-md text-label-md py-2 border-0 bg-transparent hover:text-on-surface cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
          {showCampusRequest ? (
            <div className="flex flex-col gap-4 text-center">
              {!requestSuccess ? (
                <>
                  <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center text-error mx-auto mb-2">
                    <span className="material-symbols-outlined text-3xl">domain_disabled</span>
                  </div>
                  <h2 className="font-headline-md font-bold text-on-surface">Campus Not Found</h2>
                  <p className="text-on-surface-variant font-body-sm mb-4">
                    The domain <strong>@{email.split('@')[1]}</strong> is not in our verified network yet. Request access below!
                  </p>
                  {errorMsg && (
                    <div className="bg-error-container/20 border border-error/20 text-error px-md py-3 rounded-xl flex items-center gap-sm font-body-md text-sm text-left">
                      <span className="material-symbols-outlined text-lg">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  <form onSubmit={handleCampusRequest} className="space-y-4 text-left">
                    <div>
                      <label className="block font-label-md text-on-surface-variant mb-xs font-semibold">Institution Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Indore Institute"
                        value={campusName}
                        onChange={(e) => setCampusName(e.target.value)}
                        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-md py-3 outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold border-0 cursor-pointer"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCampusRequest(false)}
                      className="w-full text-on-surface-variant py-2 border-0 bg-transparent cursor-pointer hover:underline"
                    >
                      Back
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-primary mx-auto mb-2">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                  </div>
                  <h2 className="font-headline-md font-bold text-on-surface">Request Sent!</h2>
                  <p className="text-on-surface-variant font-body-md mb-4">
                    We will review <strong>@{email.split('@')[1]}</strong> shortly. Once approved, you can register immediately.
                  </p>
                  <button
                    onClick={() => {
                      setShowCampusRequest(false);
                      setRequestSuccess(false);
                    }}
                    className="w-full bg-surface-variant text-on-surface py-3.5 rounded-xl font-bold border-0 cursor-pointer"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
