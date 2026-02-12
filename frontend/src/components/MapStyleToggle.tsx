import { motion } from 'framer-motion';
import { Sun, Moon, Mountain } from 'lucide-react';
import { Button } from './ui/button';

export type MapStyle = 'day' | 'night' | 'terrain';

interface MapStyleToggleProps {
    currentStyle: MapStyle;
    onStyleChange: (style: MapStyle) => void;
}

const MapStyleToggle = ({ currentStyle, onStyleChange }: MapStyleToggleProps) => {
    const styles: Array<{ value: MapStyle; label: string; icon: React.ComponentType<any> }> = [
        { value: 'day', label: 'Day', icon: Sun },
        { value: 'night', label: 'Night', icon: Moon },
        { value: 'terrain', label: 'Terrain', icon: Mountain },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 z-[800] flex gap-1 glass-panel p-1 rounded-lg shadow-lg backdrop-blur-xl bg-background/40 border border-border/30"
        >
            {styles.map(({ value, label, icon: Icon }) => {
                const isActive = currentStyle === value;
                return (
                    <Button
                        key={value}
                        variant={isActive ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onStyleChange(value)}
                        className={`h-8 px-3 transition-all ${isActive ? 'shadow-md' : 'hover:bg-accent/50'}`}
                    >
                        <Icon className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-medium">{label}</span>
                    </Button>
                );
            })}
        </motion.div>
    );
};

export default MapStyleToggle;
