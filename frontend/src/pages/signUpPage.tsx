import React, { useEffect, useState } from 'react'
import BorderAnimatedContainer from '../components/borderAnimatedContainer'
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

function SignUpPage() {
  const {isSigningUp, signup, authError, clearAuthError} = useAuthStore()
  const [formData, setFormData] = useState({fullName: "", email: "", password: ""})
  const [shakeCard, setShakeCard] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    if (!authError) return;
    setShakeCard(true);
    const timer = setTimeout(() => setShakeCard(false), 500);
    return () => clearTimeout(timer);
  }, [authError]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    signup(formData)
  }

   return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px] scale-[0.95] motion-scale-in">
        <BorderAnimatedContainer>
          <div className={`w-full flex flex-col md:flex-row ${shakeCard ? "motion-shake" : ""}`}>
            {/* FORM CLOUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8 motion-fade-up">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4 motion-fade-up motion-stagger-1" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Create Account</h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* FULL NAME */}
                  <div className="motion-fade-up motion-stagger-2">
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />

                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input"
                        placeholder="Your Name"
                        disabled={isSigningUp}
                      />
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div className="motion-fade-up motion-stagger-3">
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />

                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="youremail@gmail.com"
                        disabled={isSigningUp}
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="motion-fade-up motion-stagger-4">
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />

                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Enter your password"
                        disabled={isSigningUp}
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="auth-btn motion-fade-up motion-stagger-5" type="submit" disabled={isSigningUp}>
                    {isSigningUp ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {authError && (
                  <p className="mt-4 text-sm text-red-500 text-center" role="alert">
                    {authError}
                  </p>
                )}

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default SignUpPage
