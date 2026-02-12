import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { activeAlerts } from '@/lib/mockData';
import { Button } from './ui/button';

const AlertBanner = () => {
    const [visible, setVisible] = useState(true);
    const [currentAlert, setCurrentAlert] = useState(0);

    useEffect(() => {
        if (activeAlerts.length > 1) {
            const interval = setInterval(() => {
                setCurrentAlert((prev) => (prev + 1) % activeAlerts.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    if (!visible || activeAlerts.length === 0) return null;

    const alert = activeAlerts[currentAlert];
    const isWarning = alert.type === 'warning';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentAlert}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 z-[700] max-w-3xl w-full px-4"
            >
                <div
                    className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-xl ${isWarning
                            ? 'bg-destructive/10 border-destructive/50'
                            : 'bg-warning/10 border-warning/50'
                        }`}
                >
                    <AlertTriangle
                        className={`w-5 h-5 mt-0.5 hazard-pulse ${isWarning ? 'text-destructive' : 'text-warning'
                            }`}
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className={`text-xs font-semibold uppercase tracking-wider ${isWarning ? 'text-destructive' : 'text-warning'
                                    }`}
                            >
                                {alert.type}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{alert.region}</span>
                        </div>
                        <p className="text-sm text-foreground font-medium">{alert.message}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => setVisible(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AlertBanner;
