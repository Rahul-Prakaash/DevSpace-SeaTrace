import { motion } from 'framer-motion';
import { Waves, Menu, X, Layers, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
    showHeatmap: boolean;
    onToggleHeatmap: () => void;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const Header = ({ showHeatmap, onToggleHeatmap, sidebarOpen, onToggleSidebar }: HeaderProps) => {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-6 py-4 bg-card/95 backdrop-blur-xl border-b border-border/50 z-50"
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className=""
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Waves className="w-8 h-8 text-primary wave-float" />
                        <div className="absolute inset-0 sea-glow rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gradient-sea">
                            SeaTrace
                        </h1>
                        <p className="text-xs text-muted-foreground">Collective Hazard Mapping</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant={showHeatmap ? 'default' : 'outline'}
                    size="sm"
                    onClick={onToggleHeatmap}
                    className="hidden sm:flex gap-2"
                >
                    <Layers className="w-4 h-4" />
                    Heatmap
                </Button>

                <Button size="sm" className="gap-2 bg-gradient-sea hover:opacity-90">
                    <Plus className="w-4 h-4" />
                    Report Hazard
                </Button>
            </div>
        </motion.header>
    );
};

export default Header;
