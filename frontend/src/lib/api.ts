import { HazardReport, AlertData, Prediction } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Error classification ───

type ApiErrorKind = 'network' | 'cors' | 'http' | 'parse' | 'unknown';

interface ApiError {
    kind: ApiErrorKind;
    message: string;
    status?: number;
}

function classifyError(err: unknown, response?: Response): ApiError {
    // Network / CORS (fetch itself throws)
    if (err instanceof TypeError) {
        const msg = (err as TypeError).message;
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
            return {
                kind: msg.includes('CORS') ? 'cors' : 'network',
                message: 'Cannot reach the server. Please check your connection.',
            };
        }
    }

    // HTTP error (we called this ourselves)
    if (response && !response.ok) {
        if (response.status >= 500) {
            return { kind: 'http', status: response.status, message: 'Server error. Please try again later.' };
        }
        // 4xx will have a message from the server, handled at call site
    }

    if (err instanceof SyntaxError) {
        return { kind: 'parse', message: 'Unexpected server response.' };
    }

    return {
        kind: 'unknown',
        message: err instanceof Error ? err.message : 'Something went wrong.',
    };
}

/**
 * Safe fetch wrapper. Returns { ok, data?, error? }
 */
async function safeFetch<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string; status?: number }> {
    let response: Response;
    try {
        response = await fetch(url, init);
    } catch (err) {
        const classified = classifyError(err);
        return { ok: false, error: classified.message };
    }

    // Try to parse JSON regardless of status
    let data: any;
    try {
        data = await response.json();
    } catch (err) {
        if (!response.ok) {
            const classified = classifyError(err, response);
            return { ok: false, error: classified.message, status: response.status };
        }
        // 2xx but no JSON body — still ok
        return { ok: true, data: undefined as any };
    }

    if (!response.ok) {
        const serverMsg = data?.error || data?.message;
        if (response.status >= 500) {
            return { ok: false, error: 'Server error. Please try again later.', status: response.status };
        }
        return { ok: false, error: serverMsg || `Request failed (${response.status})`, status: response.status };
    }

    return { ok: true, data: data as T };
}

// ─── Auth result types ───

export interface AuthResult {
    ok: boolean;
    user?: any;
    token?: string;
    error?: string;
}

// ─── API ───

export const api = {
    // Hazards
    async getHazards(filters?: { type?: string; severity?: string }): Promise<HazardReport[]> {
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/hazards?${params}`);
        if (!response.ok) throw new Error('Failed to fetch hazards');
        return response.json();
    },

    async getHazard(id: string): Promise<HazardReport> {
        const response = await fetch(`${API_BASE_URL}/hazards/${id}`);
        if (!response.ok) throw new Error('Failed to fetch hazard');
        return response.json();
    },

    // Reports
    async submitReport(report: Omit<HazardReport, 'id' | 'timestamp' | 'upvotes' | 'verified'>): Promise<HazardReport> {
        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        });
        if (!response.ok) throw new Error('Failed to submit report');
        return response.json();
    },

    async verifyReport(id: string): Promise<HazardReport> {
        const response = await fetch(`${API_BASE_URL}/reports/${id}/verify`, {
            method: 'PATCH',
        });
        if (!response.ok) throw new Error('Failed to verify report');
        return response.json();
    },

    // Predictions
    async getPredictions(): Promise<Prediction[]> {
        const response = await fetch(`${API_BASE_URL}/predictions`);
        if (!response.ok) throw new Error('Failed to fetch predictions');
        return response.json();
    },

    async generatePrediction(): Promise<Prediction> {
        const response = await fetch(`${API_BASE_URL}/predictions/generate`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to generate prediction');
        return response.json();
    },

    // Alerts
    async getAlerts(): Promise<AlertData[]> {
        const response = await fetch(`${API_BASE_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    // ─── Auth (resilient) ───

    async signup(data: { username: string; email: string; password: string }): Promise<AuthResult> {
        const result = await safeFetch<{ token: string; user: any; message: string }>(
            `${API_BASE_URL}/auth/signup`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }
        );
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, user: result.data!.user, token: result.data!.token };
    },

    async login(data: { emailOrUsername: string; password: string }): Promise<AuthResult> {
        const result = await safeFetch<{ token: string; user: any; message: string }>(
            `${API_BASE_URL}/auth/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }
        );
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, user: result.data!.user, token: result.data!.token };
    },

    async googleAuth(data: { googleId: string; email: string; displayName?: string; avatarUrl?: string }): Promise<AuthResult> {
        const result = await safeFetch<{ token: string; user: any }>(
            `${API_BASE_URL}/auth/google`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }
        );
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, user: result.data!.user, token: result.data!.token };
    },

    async getMe(): Promise<any | null> {
        const token = localStorage.getItem('seatrace_token');
        if (!token) return null;
        const result = await safeFetch<{ user: any }>(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!result.ok) return null;
        return result.data?.user || null;
    },

    async updateLocation(regionName: string, state: string, bbox: [number, number, number, number]): Promise<AuthResult> {
        const token = localStorage.getItem('seatrace_token');
        if (!token) return { ok: false, error: 'Not authenticated' };
        const result = await safeFetch<{ user: any }>(
            `${API_BASE_URL}/auth/location`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ regionName, state, bbox }),
            }
        );
        if (!result.ok) return { ok: false, error: result.error };
        return { ok: true, user: result.data?.user };
    },

    logout() {
        localStorage.removeItem('seatrace_token');
    },
};
