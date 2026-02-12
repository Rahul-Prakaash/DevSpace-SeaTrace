import { motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { SocialNotification } from '@/lib/mockData';
import { Button } from './ui/button';

interface NotificationCardProps {
    notification: SocialNotification;
    onClose: () => void;
    index: number;
}

const platformColors: Record<SocialNotification['platform'], { bg: string; border: string; icon: string }> = {
    twitter: {
        bg: 'rgba(29, 155, 240, 0.15)',
        border: '#1DA1F2',
        icon: '#1DA1F2'
    },
    facebook: {
        bg: 'rgba(24, 119, 242, 0.15)',
        border: '#1877F2',
        icon: '#1877F2'
    },
    instagram: {
        bg: 'rgba(225, 48, 108, 0.15)',
        border: '#E1306C',
        icon: '#E1306C'
    },
    telegram: {
        bg: 'rgba(0, 136, 204, 0.15)',
        border: '#0088CC',
        icon: '#0088CC'
    },
};

const NotificationCard = ({ notification, onClose, index }: NotificationCardProps) => {
    const colors = platformColors[notification.platform];
    const timestamp = new Date(notification.timestamp);
    const timeAgo = getTimeAgo(timestamp);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="relative w-80 mb-2 rounded-lg border-2 backdrop-blur-xl shadow-lg overflow-hidden"
            style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
            }}
        >
            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: colors.border }}
            />

            <div className="p-3 pl-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: colors.icon }}
                        >
                            {notification.platform[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: colors.icon }}>
                            {notification.username}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {notification.verificationStatus === 'verified' && (
                            <div className="flex items-center gap-1 bg-success/20 px-1.5 py-0.5 rounded" title="Verified">
                                <CheckCircle2 className="w-3 h-3 text-success" />
                                <span className="text-[9px] text-success font-semibold">Verified</span>
                            </div>
                        )}
                        {notification.verificationStatus === 'unverified' && (
                            <div className="flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded" title="Unverified">
                                <AlertCircle className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground font-semibold">Unverified</span>
                            </div>
                        )}
                        {notification.verificationStatus === 'ambiguous' && (
                            <div className="flex items-center gap-1 bg-warning/20 px-1.5 py-0.5 rounded" title="Ambiguous">
                                <HelpCircle className="w-3 h-3 text-warning" />
                                <span className="text-[9px] text-warning font-semibold">Unclear</span>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-background/20"
                            onClick={onClose}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-foreground/90 mb-2 line-clamp-3 leading-relaxed">
                    {notification.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    {notification.location && (
                        <span className="flex items-center gap-1">
                            📍 {notification.location}
                        </span>
                    )}
                    <span className="ml-auto">{timeAgo}</span>
                </div>
            </div>
        </motion.div>
    );
};

function getTimeAgo(date: Date): string {
    const now = new Date('2026-02-13T00:00:00Z');
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export default NotificationCard;
