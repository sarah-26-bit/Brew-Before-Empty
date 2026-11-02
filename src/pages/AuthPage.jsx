import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AICompanionOrb } from '../assets/illustrations/scenes';
import { Sparkles, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import Button from '../components/common/Button';

export default function AuthPage() {
  const { login, register, enterGuestMode, isConfigured, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('kunjatadevu2008@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [fullName, setFullName] = useState('Deva');
  const [role, setRole] = useState('Grand Magister Cynthia');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) throw new Error('Please enter your Alchemist name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        await register({ email, password, fullName, role });
        setSuccessMsg('Account created successfully! Connecting to Sanctum...');
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4 bg-arcane-mesh bg-fixed relative overflow-hidden">
      {/* Background mystical glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-antique-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Branding */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-deep-forest border border-emerald-800/60 shadow-xl shadow-black/40 mb-2">
            <AICompanionOrb className="w-10 h-10" active={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-warm-ivory tracking-wide">
            Brew Before Empty
          </h1>
          <p className="text-xs text-sage-green font-medium">
            AI-Powered Apothecary & Inventory Intelligence
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-deep-forest/90 backdrop-blur-xl border border-emerald-900/70 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-midnight/80 p-1 border border-emerald-900/50">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-serif font-semibold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-warm-ivory shadow-sm'
                  : 'text-moonlight-muted hover:text-warm-ivory'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-serif font-semibold rounded-lg transition-all ${
                isRegister
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-warm-ivory shadow-sm'
                  : 'text-moonlight-muted hover:text-warm-ivory'
              }`}
            >
              Inscribe Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-sage-green block">Alchemist Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-moonlight-muted/60" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Grand Magister Cynthia"
                      className="w-full bg-midnight/90 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-warm-ivory placeholder-moonlight-muted/40 focus:border-antique-gold/70 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-sage-green block">Sanctum Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-midnight/90 border border-emerald-900/60 rounded-xl px-3 py-2 text-xs text-warm-ivory focus:border-antique-gold/70 focus:outline-none transition-colors"
                  >
                    <option value="Grand Magister">Grand Magister</option>
                    <option value="Master Alchemist">Master Alchemist</option>
                    <option value="Apothecary Keeper">Apothecary Keeper</option>
                    <option value="Apprentice Alchemist">Apprentice Alchemist</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-sage-green block">Acolyte Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-moonlight-muted/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alchemist@brewbeforeempty.sanctum"
                  className="w-full bg-midnight/90 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-warm-ivory placeholder-moonlight-muted/40 focus:border-antique-gold/70 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-sage-green block">Vault Passphrase</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-moonlight-muted/60" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-midnight/90 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-xs text-warm-ivory placeholder-moonlight-muted/40 focus:border-antique-gold/70 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full text-xs py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 border border-antique-gold/50 shadow-lg font-serif mt-2"
              icon={isRegister ? Sparkles : ArrowRight}
            >
              {submitting ? 'Authenticating with Sanctum...' : isRegister ? 'Inscribe & Enter Vault' : 'Enter the Sanctum'}
            </Button>
          </form>

          {/* Supabase Status / Dev Guest Fallback */}
          <div className="pt-3 border-t border-emerald-900/40 text-center space-y-2">
            {!isConfigured && (
              <div className="p-2.5 rounded-lg bg-midnight/60 border border-antique-gold/30 text-[11px] text-sage-green space-y-1.5">
                <p className="flex items-center justify-center gap-1 text-antique-gold font-semibold">
                  <KeyRound className="w-3.5 h-3.5" />
                  Supabase Project Connection Pending
                </p>
                <p className="text-[10px] text-moonlight-muted">
                  Add <code className="text-antique-gold font-mono">SUPABASE_URL</code> and <code className="text-antique-gold font-mono">SUPABASE_ANON_KEY</code> to your <code className="text-antique-gold font-mono">.env</code> to activate live cloud Auth & RLS.
                </p>
                <button
                  type="button"
                  onClick={enterGuestMode}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-[11px] font-mono text-warm-ivory font-medium transition-colors"
                >
                  ⚡ Explore as Guest Alchemist (Demo Access)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center mt-4">
          <span className="text-[10px] font-mono text-moonlight-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Protected by Supabase Auth & PostgreSQL Row Level Security (RLS)
          </span>
        </div>

      </div>
    </div>
  );
}

