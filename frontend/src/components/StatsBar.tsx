import { motion } from 'framer-motion';
import { AlertTriangle, FileText, Bell, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { coastalStats } from '@/lib/mockData';

const stats = [
    { label: 'Active Hazards', value: coastalStats.activeHazards, icon: AlertTriangle, accent: 'text-destructive' },
    { label: 'Reports Today', value: coastalStats.reportsToday, icon: FileText, accent: 'text-primary' },
    { label: 'Active Alerts', value: coastalStats.activeAlerts, icon: Bell, accent: 'text-warning' },
    { label: 'Monitored Zones', value: coastalStats.monitoredZones, icon: MapPin, accent: 'text-primary' },
    { label: 'Verified', value: coastalStats.verifiedReports, icon: ShieldCheck, accent: 'text-success' },
    { label: 'Avg Response', value: coastalStats.avgResponseTime, icon: Clock, accent: 'text-muted-foreground' },
];

const StatsBar = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-1 px-3 py-2 glass-panel rounded-full shadow-lg shadow-background/50"
        >
            {stats.map((stat, i) => (
                <div
                    key={stat.label}
                    className="flex items-center gap-1.5 px-2.5 py-1"
                >
                    <stat.icon className={`w-3 h-3 ${stat.accent}`} />
                    <span className="text-xs font-semibold text-foreground">{stat.value}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider hidden lg:inline">{stat.label}</span>
                    {i < stats.length - 1 && (
                        <div className="w-px h-3 bg-border/50 ml-1.5" />
                    )}
                </div>
            ))}
        </motion.div>
    );
};

export default StatsBar;
