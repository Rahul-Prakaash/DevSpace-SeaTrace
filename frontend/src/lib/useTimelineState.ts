import { create } from 'zustand';

interface TimelineState {
    selectedTimestamp: Date;
    setSelectedTimestamp: (timestamp: Date | ((prev: Date) => Date)) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
}

// Create zustand store for timeline state
export const useTimelineStore = create<TimelineState>((set) => ({
    selectedTimestamp: new Date('2026-02-13T00:00:00Z'), // Current time (now)
    setSelectedTimestamp: (timestamp) => set((state) => ({
        selectedTimestamp: typeof timestamp === 'function' ? timestamp(state.selectedTimestamp) : timestamp
    })),
    isPlaying: false,
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    playbackSpeed: 1,
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
}));

// Helper function to get time range (7 days past to 3 days future)
export function getTimelineRange() {
    const now = new Date('2026-02-13T00:00:00Z');
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    const end = new Date(now);
    end.setDate(end.getDate() + 3);
    return { start, end, now };
}

// Format date for display
export function formatTimelineDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
}

// Get data for specific timestamp
export function getDataAtTimestamp(timestamp: Date, allData: any[]) {
    // Filter data to show only reports up to the selected timestamp
    return allData.filter(item => new Date(item.timestamp) <= timestamp);
}
