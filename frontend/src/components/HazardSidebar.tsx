import { HazardReport, hazardReports } from '@/lib/mockData';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatDate, getSeverityColor } from '@/lib/utils';
import { Waves, Wind, TrendingUp, Mountain, AlertTriangle, CloudLightning, Plus, Droplets, MapPin } from 'lucide-react';
import { useAuthStore } from '@/lib/useAuthStore';
import { isPointInBbox } from '@/lib/locationData';

interface HazardSidebarProps {
    selectedReport: HazardReport | null;
    onSelectReport: (report: HazardReport) => void;
    selectedType: string | null;
    onSelectType: (type: string | null) => void;
}

const hazardIcons: Record<string, any> = {
    tsunami: Waves,
    storm_surge: Wind,
    high_tide: TrendingUp,
    erosion: Mountain,
    rip_current: AlertTriangle,
    cyclone: CloudLightning,
    coastal_flood: Droplets,
};

const HazardSidebar = ({
    selectedReport,
    onSelectReport,
    selectedType,
    onSelectType,
}: HazardSidebarProps) => {
    const region = useAuthStore(s => s.region);

    // Filter by type
    let filteredReports = selectedType
        ? hazardReports.filter((r) => r.type === selectedType)
        : hazardReports;

    // Filter by region bounding box (if set)
    if (region && region.bbox) {
        filteredReports = filteredReports.filter(r =>
            isPointInBbox(r.lat, r.lng, region.bbox)
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Report Hazard button — prominent at top */}
            <div className="p-4 border-b border-border/50">
                <Button
                    className="w-full gap-2 bg-gradient-sea hover:opacity-90 font-semibold py-2.5"
                    size="sm"
                >
                    <Plus className="w-4 h-4" />
                    Report Hazard
                </Button>
            </div>

            {/* Filter badges */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Hazard Reports</h2>
                    {region && (
                        <div className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {region.name}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge
                        variant={selectedType === null ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => onSelectType(null)}
                    >
                        All
                    </Badge>
                    {Object.keys(hazardIcons).map((type) => (
                        <Badge
                            key={type}
                            variant={selectedType === type ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => onSelectType(type)}
                        >
                            {type.replace('_', ' ')}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Report list */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {filteredReports.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                {region
                                    ? `No hazard reports near ${region.name}`
                                    : 'No hazard reports found'}
                            </p>
                            {region && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Try changing your location or removing the filter
                                </p>
                            )}
                        </div>
                    )}
                    {filteredReports.map((report) => {
                        const Icon = hazardIcons[report.type] || AlertTriangle;
                        const isSelected = selectedReport?.id === report.id;

                        return (
                            <div
                                key={report.id}
                                onClick={() => onSelectReport(report)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${isSelected
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-card/50 border-border/30'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`p-2 rounded-lg ${report.severity === 'critical'
                                            ? 'bg-[hsl(var(--hazard-critical))]/10'
                                            : report.severity === 'high'
                                                ? 'bg-destructive/10'
                                                : report.severity === 'medium'
                                                    ? 'bg-warning/10'
                                                    : 'bg-success/10'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${getSeverityColor(report.severity)}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-sm font-semibold line-clamp-1">
                                                {report.title}
                                            </h3>
                                            {report.verified && (
                                                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                                    ✓
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {report.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            <span>{formatDate(report.timestamp)}</span>
                                            <span>•</span>
                                            <span>{report.upvotes} upvotes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

export default HazardSidebar;
