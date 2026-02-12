import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { socialNotifications, SocialNotification } from '@/lib/mockData';
import { useTimelineStore } from '@/lib/useTimelineState';
import NotificationCard from './NotificationCard';

const MAX_VISIBLE_NOTIFICATIONS = 4;

const SocialNotifications = () => {
    const { selectedTimestamp } = useTimelineStore();
    const [visibleNotifications, setVisibleNotifications] = useState<SocialNotification[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        const filtered = socialNotifications
            .filter(notif => {
                const notifTime = new Date(notif.timestamp);
                const isBeforeSelected = notifTime <= selectedTimestamp;
                const notDismissed = !dismissed.has(notif.id);
                const timeDiff = selectedTimestamp.getTime() - notifTime.getTime();
                const within6Hours = timeDiff <= 6 * 60 * 60 * 1000 && timeDiff >= 0;
                return isBeforeSelected && notDismissed && within6Hours;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, MAX_VISIBLE_NOTIFICATIONS);

        setVisibleNotifications(filtered);
    }, [selectedTimestamp, dismissed]);

    const handleDismiss = (id: string) => {
        setDismissed(prev => new Set(prev).add(id));
    };

    if (visibleNotifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-[850] flex flex-col-reverse">
            <AnimatePresence mode="popLayout">
                {visibleNotifications.map((notification, index) => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onClose={() => handleDismiss(notification.id)}
                        index={index}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SocialNotifications;
