import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { socialNotifications, SocialNotification } from '@/lib/mockData';
import { useTimelineStore } from '@/lib/useTimelineState';
import { useAuthStore } from '@/lib/useAuthStore';
import { isPointInBbox } from '@/lib/locationData';
import NotificationCard from './NotificationCard';

const MAX_VISIBLE_NOTIFICATIONS = 4;

const SocialNotifications = () => {
    const { selectedTimestamp } = useTimelineStore();
    const region = useAuthStore(s => s.region);
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

                if (!isBeforeSelected || !notDismissed || !within6Hours) return false;

                // Region filter: if user has a region set and notification has coordinates
                if (region && region.bbox && notif.lat != null && notif.lng != null) {
                    if (!isPointInBbox(notif.lat, notif.lng, region.bbox)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, MAX_VISIBLE_NOTIFICATIONS);

        setVisibleNotifications(filtered);
    }, [selectedTimestamp, dismissed, region]);

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
