import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, Globe } from 'lucide-react';

export type MapStyle = 'night' | 'day' | 'terrain';

const styleOrder: MapStyle[] = ['night', 'day', 'terrain'];

const styleConfig: Record<MapStyle, { label: string; icon: React.ComponentType<any>; next: string }> = {
    night: { label: 'Dark', icon: Moon, next: 'Light' },
    day: { label: 'Light', icon: Sun, next: 'Terrain' },
    terrain: { label: 'Terrain', icon: Globe, next: 'Dark' },
};

interface MapStyleToggleProps {
    currentStyle: MapStyle;
    onStyleChange: (style: MapStyle) => void;
}

const MapStyleToggle = ({ currentStyle, onStyleChange }: MapStyleToggleProps) => {
    const config = styleConfig[currentStyle];
    const Icon = config.icon;

    const handleClick = () => {
        const idx = styleOrder.indexOf(currentStyle);
        onStyleChange(styleOrder[(idx + 1) % styleOrder.length]);
    };

    return (
        <button
            onClick={handleClick}
            title={`Switch to ${config.next} mode`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/40 bg-background/60 hover:bg-accent/30 transition-all cursor-pointer"
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentStyle}
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">{config.label}</span>
                </motion.span>
            </AnimatePresence>
        </button>
    );
};

export default MapStyleToggle;
