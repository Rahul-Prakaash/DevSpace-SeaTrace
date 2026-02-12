import { motion } from 'framer-motion';
import { X, MapPin, Clock, User, ThumbsUp, ShieldCheck } from 'lucide-react';
import { HazardReport } from '@/lib/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { formatDate, getSeverityColor } from '@/lib/utils';

interface ReportDetailProps {
    report: HazardReport;
    onClose: () => void;
}

const ReportDetail = ({ report, onClose }: ReportDetailProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="w-80 glass-panel shadow-2xl">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge
                            variant={
                                report.severity === 'critical' || report.severity === 'high'
                                    ? 'destructive'
                                    : report.severity === 'medium'
                                        ? 'warning'
                                        : 'success'
                            }
                            className="capitalize"
                        >
                            {report.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {report.type.replace('_', ' ')}
                        </Badge>
                        {report.verified && (
                            <Badge variant="success" className="gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-foreground">{report.description}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            <span>Reported by {report.reporter}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(report.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                                {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{report.upvotes} community upvotes</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-2">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Upvote
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                            Share
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ReportDetail;
