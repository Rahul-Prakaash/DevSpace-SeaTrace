import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Chrome, AlertCircle, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/useAuthStore';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthMode;
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [errorKind, setErrorKind] = useState<'network' | 'validation' | 'server' | ''>('');
    const [loading, setLoading] = useState(false);

    const login = useAuthStore(s => s.login);

    // Sync mode with initialMode whenever the modal opens or initialMode changes
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setEmail('');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setShowPassword(false);
            setShowConfirmPassword(false);
            setError('');
            setErrorKind('');
            setLoading(false);
        }
    }, [isOpen, initialMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setErrorKind('');

        // Client-side validation
        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            setErrorKind('validation');
            return;
        }

        setLoading(true);
        try {
            let result;
            if (mode === 'login') {
                result = await api.login({ emailOrUsername: email, password });
            } else {
                result = await api.signup({ username, email, password });
            }

            if (result.ok && result.user && result.token) {
                // Update in-memory auth state — no redirect!
                login(result.user, result.token);
                onClose();
            } else {
                // Classify error for UX
                const errMsg = result.error || 'Something went wrong';
                if (errMsg.includes('Cannot reach') || errMsg.includes('connection')) {
                    setErrorKind('network');
                } else if (errMsg.includes('Server error')) {
                    setErrorKind('server');
                } else {
                    setErrorKind('validation');
                }
                setError(errMsg);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setErrorKind('network');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError('Google OAuth integration requires a Google Cloud project. Use email/password for now.');
        setErrorKind('validation');
    };

    const switchMode = () => {
        setMode(m => m === 'login' ? 'signup' : 'login');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setError('');
        setErrorKind('');
    };

    const ErrorIcon = errorKind === 'network' ? WifiOff
        : errorKind === 'server' ? ServerCrash
            : AlertCircle;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9000]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed inset-0 z-[9001] flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-md bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative px-6 pt-6 pb-4">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {mode === 'login'
                                            ? 'Sign in to access your hazard reports'
                                            : 'Join SeaTrace to report and track coastal hazards'
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6">
                                {/* Google Auth Button */}
                                <button
                                    onClick={handleGoogleAuth}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-background/50 hover:bg-accent/10 transition-all text-sm font-medium"
                                >
                                    <Chrome className="w-5 h-5 text-[#4285F4]" />
                                    <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3 my-5">
                                    <div className="flex-1 h-px bg-border/40" />
                                    <span className="text-xs text-muted-foreground font-medium">or</span>
                                    <div className="flex-1 h-px bg-border/40" />
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Username — signup only */}
                                    {mode === 'signup' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">Username</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={e => setUsername(e.target.value)}
                                                    placeholder="Choose a username"
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email / Gmail */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            {mode === 'login' ? 'Email or Username' : 'Email Address'}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type={mode === 'signup' ? 'email' : 'text'}
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder={mode === 'login' ? 'you@gmail.com or username' : 'you@gmail.com'}
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(p => !p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password — signup only */}
                                    {mode === 'signup' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm your password"
                                                    required
                                                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-background/60 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(p => !p)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Forgot password — login only */}
                                    {mode === 'login' && (
                                        <div className="text-right">
                                            <button type="button" className="text-xs text-primary hover:underline">
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    {/* Error message — with distinct icons per error kind */}
                                    {error && (
                                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${errorKind === 'network'
                                                ? 'bg-warning/10 border border-warning/20 text-warning'
                                                : 'bg-destructive/10 border border-destructive/20 text-destructive'
                                            }`}>
                                            <ErrorIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-xl bg-gradient-sea hover:opacity-90 font-semibold transition-all disabled:opacity-50"
                                    >
                                        {loading
                                            ? 'Please wait...'
                                            : mode === 'login' ? 'Sign In' : 'Create Account'
                                        }
                                    </Button>
                                </form>

                                {/* Toggle mode */}
                                <p className="text-center text-sm text-muted-foreground mt-5">
                                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                    <button
                                        onClick={switchMode}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
