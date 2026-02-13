import { useState, useRef, useEffect } from 'react';
import { MapPin, LogOut, Search, X, Check, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/lib/useAuthStore';
import { searchRegions, RegionEntry } from '@/lib/locationData';
import { api } from '@/lib/api';

const UserProfileDropdown = () => {
    const { user, region, logout, setRegion } = useAuthStore();
    const [locationQuery, setLocationQuery] = useState('');
    const [suggestions, setSuggestions] = useState<RegionEntry[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [showLocationInput, setShowLocationInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update suggestions as user types
    useEffect(() => {
        if (locationQuery.trim().length > 0) {
            setSuggestions(searchRegions(locationQuery));
        } else {
            setSuggestions([]);
        }
    }, [locationQuery]);

    // Focus input when location editing opens
    useEffect(() => {
        if (showLocationInput && inputRef.current) {
            // Tiny delay to allow Radix animation
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [showLocationInput]);

    if (!user) return null;

    const initials = (user.displayName || user.username || 'U')
        .split(' ')
        .map(s => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleSelectRegion = async (entry: RegionEntry) => {
        setLocationLoading(true);
        setLocationError('');
        try {
            const result = await api.updateLocation(entry.name, entry.state, entry.bbox);
            if (result.ok) {
                setRegion({ name: entry.name, state: entry.state, bbox: entry.bbox });
                setLocationQuery('');
                setSuggestions([]);
                setShowLocationInput(false);
            } else {
                setLocationError(result.error || 'Failed to update location');
            }
        } catch {
            setLocationError('Failed to update location');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleClearLocation = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setRegion(null);
        setLocationQuery('');
        setShowLocationInput(false);
    };

    const handleLogout = () => {
        logout();
        api.logout();
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-accent/20 transition-colors bg-transparent border-0 outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="User profile"
                >
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-8 h-8 rounded-full border-2 border-primary/40"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-sea flex items-center justify-center text-xs font-bold text-white border-2 border-primary/30">
                            {initials}
                        </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="z-[9000] w-72 bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                    sideOffset={8}
                    align="end"
                >
                    {/* User info */}
                    <div className="px-4 pt-4 pb-3 border-b border-border/30">
                        <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full border-2 border-primary/30"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-sea flex items-center justify-center text-sm font-bold text-white">
                                    {initials}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-foreground">{user.displayName || user.username}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location section */}
                    <div className="px-4 py-3 border-b border-border/30">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Location</span>
                            </div>
                            {region && !showLocationInput && (
                                <button
                                    onClick={handleClearLocation}
                                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {region && !showLocationInput ? (
                            <button
                                onClick={() => setShowLocationInput(true)}
                                className="w-full text-left px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer"
                            >
                                <p className="text-sm font-medium text-foreground">{region.name}</p>
                                <p className="text-[10px] text-muted-foreground">{region.state} — click to change</p>
                            </button>
                        ) : (
                            <div className="space-y-2" onKeyDown={e => e.stopPropagation()}>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={locationQuery}
                                        onChange={e => setLocationQuery(e.target.value)}
                                        placeholder="Search region..."
                                        className="w-full pl-8 pr-8 py-2 rounded-lg bg-background/60 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 text-foreground"
                                    />
                                    {locationQuery && (
                                        <button
                                            onClick={() => { setLocationQuery(''); setSuggestions([]); }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Suggestions list */}
                                {suggestions.length > 0 && (
                                    <div className="max-h-36 overflow-y-auto rounded-lg border border-border/30 bg-background/80">
                                        {suggestions.map((entry, i) => (
                                            <button
                                                key={`${entry.name}-${i}`}
                                                onClick={() => handleSelectRegion(entry)}
                                                disabled={locationLoading}
                                                className="w-full text-left px-3 py-2 hover:bg-accent/20 transition-colors flex items-center justify-between border-b border-border/20 last:border-0 cursor-pointer"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{entry.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{entry.state}</p>
                                                </div>
                                                {region?.name === entry.name && (
                                                    <Check className="w-3.5 h-3.5 text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {locationQuery.length > 0 && suggestions.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-2">No regions found</p>
                                )}

                                {!region && !showLocationInput && (
                                    <p className="text-xs text-muted-foreground">Set location to filter hazards</p>
                                )}

                                {showLocationInput && region && (
                                    <button
                                        onClick={() => setShowLocationInput(false)}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        ← Cancel
                                    </button>
                                )}
                            </div>
                        )}

                        {locationError && (
                            <p className="text-xs text-destructive mt-1.5">{locationError}</p>
                        )}

                        {locationLoading && (
                            <p className="text-xs text-muted-foreground mt-1.5">Updating...</p>
                        )}
                    </div>

                    <DropdownMenu.Item asChild>
                        <div className="px-4 py-2.5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default UserProfileDropdown;
