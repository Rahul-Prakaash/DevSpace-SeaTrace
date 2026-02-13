import { create } from 'zustand';
import { api } from './api';

export interface UserRegion {
    name: string;
    state: string;
    bbox: [number, number, number, number]; // [south, west, north, east]
}

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    authProvider: string;
    region?: UserRegion;
}

type AuthStatus = 'anonymous' | 'loading' | 'authenticated';

interface AuthState {
    user: AuthUser | null;
    status: AuthStatus;
    region: UserRegion | null;

    // Actions
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    setRegion: (region: UserRegion | null) => void;
    initAuth: () => Promise<void>;
}

const REGION_STORAGE_KEY = 'seatrace_user_region';

function loadSavedRegion(): UserRegion | null {
    try {
        const raw = localStorage.getItem(REGION_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore corrupt data */ }
    return null;
}

function saveRegion(region: UserRegion | null) {
    try {
        if (region) {
            localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region));
        } else {
            localStorage.removeItem(REGION_STORAGE_KEY);
        }
    } catch { /* ignore storage errors */ }
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: 'anonymous',
    region: null,

    login: (user: AuthUser, token: string) => {
        localStorage.setItem('seatrace_token', token);
        const region = user.region || loadSavedRegion();
        if (region) saveRegion(region);
        set({ user, status: 'authenticated', region });
    },

    logout: () => {
        localStorage.removeItem('seatrace_token');
        localStorage.removeItem(REGION_STORAGE_KEY);
        set({ user: null, status: 'anonymous', region: null });
    },

    setRegion: (region: UserRegion | null) => {
        saveRegion(region);
        set({ region });
    },

    initAuth: async () => {
        const token = localStorage.getItem('seatrace_token');
        if (!token) {
            // Still try to restore region for anonymous users? No — region is auth-only.
            set({ status: 'anonymous' });
            return;
        }

        set({ status: 'loading' });
        try {
            const user = await api.getMe();
            if (user) {
                const savedRegion = user.region || loadSavedRegion();
                set({
                    user,
                    status: 'authenticated',
                    region: savedRegion || null,
                });
            } else {
                // Token invalid or expired — clean up silently
                localStorage.removeItem('seatrace_token');
                set({ status: 'anonymous', user: null });
            }
        } catch {
            // Network error — keep anonymous but don't wipe token
            // (server might just be down temporarily)
            set({ status: 'anonymous' });
        }
    },
}));
