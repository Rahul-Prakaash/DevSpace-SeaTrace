import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function calculateRiskScore(
    severity: 'low' | 'medium' | 'high' | 'critical',
    verified: boolean,
    upvotes: number
): number {
    const severityScores = { low: 0.25, medium: 0.5, high: 0.75, critical: 1.0 };
    const baseScore = severityScores[severity];
    const verifiedBonus = verified ? 0.1 : 0;
    const upvoteBonus = Math.min(upvotes / 100, 0.1);

    return Math.min(baseScore + verifiedBonus + upvoteBonus, 1.0);
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const colors = {
        low: 'text-success',
        medium: 'text-warning',
        high: 'text-destructive',
        critical: 'text-[hsl(var(--hazard-critical))]',
    };
    return colors[severity];
}
