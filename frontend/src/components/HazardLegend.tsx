import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { disasterColors, HazardReport } from '@/lib/mockData';
import { Button } from './ui/button';

interface HazardLegendProps {
    visibleTypes: Set<HazardReport['type']>;
    onToggleType: (type: HazardReport['type']) => void;
}

const HazardLegend = ({ visibleTypes, onToggleType }: HazardLegendProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const hazardTypes: Array<{ type: HazardReport['type']; label: string }> = [
        { type: 'tsunami', label: 'Tsunami' },
        { type: 'cyclone', label: 'Cyclone' },
        { type: 'storm_surge', label: 'Storm Surge' },
        { type: 'high_tide', label: 'High Tide' },
        { type: 'erosion', label: 'Erosion' },
        { type: 'rip_current', label: 'Rip Current' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-20 left-4 z-[800] w-52"
        >
            <div className="glass-panel rounded-lg shadow-lg overflow-hidden border border-border/30 backdrop-blur-xl bg-background/40">
                <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/5 transition-colors border-b border-border/20"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <h3 className="text-sm font-semibold">Hazard Legend</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-2 space-y-1">
                                {hazardTypes.map(({ type, label }) => {
                                    const isVisible = visibleTypes.has(type);
                                    const colors = disasterColors[type];

                                    return (
                                        <button
                                            key={type}
                                            onClick={() => onToggleType(type)}
                                            className={`w-full flex items-center gap-2 p-2 rounded-md transition-all hover:bg-accent/10 ${isVisible ? 'opacity-100' : 'opacity-40'
                                                }`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-sm flex-shrink-0 border-2"
                                                style={{
                                                    background: colors.gradient,
                                                    borderColor: colors.border,
                                                }}
                                            />

                                            <span className="text-xs font-medium flex-1 text-left">{label}</span>

                                            {isVisible ? (
                                                <Eye className="h-3 w-3 text-primary" />
                                            ) : (
                                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="px-3 py-2 text-[10px] text-muted-foreground border-t border-border/20">
                                <div className="flex items-center gap-1 mb-1">
                                    <div className="w-3 h-0.5 bg-foreground" />
                                    <span>Actual</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-0.5 border-t-2 border-dashed border-warning" />
                                    <span>Predicted</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default HazardLegend;
