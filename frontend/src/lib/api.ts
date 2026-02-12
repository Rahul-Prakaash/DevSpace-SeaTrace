import { HazardReport, AlertData, Prediction } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
};
