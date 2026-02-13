import { motion } from 'framer-motion';
import { Waves, Menu, X, Layers, LogIn, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import MapStyleToggle, { MapStyle } from './MapStyleToggle';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuthStore } from '@/lib/useAuthStore';

interface HeaderProps {
    showHeatmap: boolean;
    onToggleHeatmap: () => void;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    mapStyle: MapStyle;
    onMapStyleChange: (style: MapStyle) => void;
    onOpenLogin: () => void;
    onOpenSignup: () => void;
}

const Header = ({ showHeatmap, onToggleHeatmap, sidebarOpen, onToggleSidebar, mapStyle, onMapStyleChange, onOpenLogin, onOpenSignup }: HeaderProps) => {
    const { status } = useAuthStore();
    const isAuthenticated = status === 'authenticated';

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-[5000] flex items-center justify-between px-6 py-4 pointer-events-none"
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="pointer-events-auto shadow-lg bg-card/90 backdrop-blur-xl border border-border/50"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>

                <div className="flex items-center gap-3 pointer-events-auto bg-card/90 backdrop-blur-xl border border-border/50 rounded-full pl-2 pr-5 py-1.5 shadow-lg">
                    <div className="relative">
                        <Waves className="w-7 h-7 text-primary wave-float" />
                        <div className="absolute inset-0 sea-glow rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient-sea leading-none">
                            SeaTrace
                        </h1>
                        <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Collective Hazard Mapping</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pointer-events-auto bg-card/90 backdrop-blur-xl border border-border/50 rounded-full px-2 py-1.5 shadow-lg">
                {/* Map style toggle */}
                <MapStyleToggle currentStyle={mapStyle} onStyleChange={onMapStyleChange} />

                <Button
                    variant={showHeatmap ? 'default' : 'ghost'}
                    size="sm"
                    onClick={onToggleHeatmap}
                    className="hidden sm:flex gap-2 h-8"
                >
                    <Layers className="w-4 h-4" />
                    Heatmap
                </Button>

                {/* Auth: avatar dropdown when logged in, login/signup when anonymous */}
                {isAuthenticated ? (
                    <UserProfileDropdown />
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onOpenLogin}
                            className="gap-2 h-8"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline">Login</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={onOpenSignup}
                            className="gap-2 bg-gradient-sea hover:opacity-90 h-8"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Up</span>
                        </Button>
                    </>
                )}
            </div>
        </motion.header>
    );
};

export default Header;
