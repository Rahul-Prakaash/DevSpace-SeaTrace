import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimelineStore, getTimelineRange, formatTimelineDate } from '@/lib/useTimelineState';
import { Button } from './ui/button';

const TimelineControl = () => {
    const { selectedTimestamp, setSelectedTimestamp, isPlaying, setIsPlaying } = useTimelineStore();
    const { start, end, now } = getTimelineRange();
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Total time range in milliseconds
    const totalRange = end.getTime() - start.getTime();
    const currentPosition = ((selectedTimestamp.getTime() - start.getTime()) / totalRange) * 100;

    // Handle slider drag
    const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const newTimestamp = new Date(start.getTime() + (totalRange * percentage) / 100);
        setSelectedTimestamp(newTimestamp);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newTimestamp = new Date(start.getTime() + (totalRange * percentage) / 100);
        setSelectedTimestamp(newTimestamp);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    // Playback functionality
    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = setInterval(() => {
                setSelectedTimestamp((prev: Date) => {
                    const next = new Date(prev.getTime() + 3600000); // +1 hour
                    if (next > end) {
                        setIsPlaying(false);
                        return end;
                    }
                    return next;
                });
            }, 500);
        } else if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
        }
        return () => {
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        };
    }, [isPlaying, end, setIsPlaying, setSelectedTimestamp]);

    // Jump to specific time
    const jumpToNow = () => setSelectedTimestamp(now);
    const jumpBackward = () => setSelectedTimestamp(new Date(selectedTimestamp.getTime() - 86400000));
    const jumpForward = () => setSelectedTimestamp(new Date(selectedTimestamp.getTime() + 86400000));

    // Generate tick marks
    const tickMarks = [];
    for (let i = 0; i <= 10; i++) {
        const tickDate = new Date(start);
        tickDate.setDate(tickDate.getDate() + i);
        const tickPosition = ((tickDate.getTime() - start.getTime()) / totalRange) * 100;
        const isNow = Math.abs(tickDate.getTime() - now.getTime()) < 43200000;
        const isPast = tickDate < now;
        const isFuture = tickDate > now;

        tickMarks.push({
            position: tickPosition,
            date: tickDate,
            isNow,
            isPast,
            isFuture,
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 z-[900] bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-xl border-t border-border/50 shadow-2xl"
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={jumpBackward}
                        className="h-8 w-8 glass-panel"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant={isPlaying ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-9 w-9 glass-panel"
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={jumpForward}
                        className="h-8 w-8 glass-panel"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={jumpToNow}
                        className="glass-panel text-xs h-8 px-3"
                    >
                        Now
                    </Button>

                    <div className="text-sm font-semibold ml-6 min-w-[180px] text-center glass-panel px-4 py-1.5 rounded-full">
                        {formatTimelineDate(selectedTimestamp)}
                    </div>
                </div>

                <div className="relative">
                    <div
                        ref={sliderRef}
                        onClick={handleSliderClick}
                        className="relative h-14 cursor-pointer bg-card/30 rounded-lg border border-border/30 overflow-hidden"
                    >
                        {tickMarks.map((tick, idx) => (
                            <div
                                key={idx}
                                className="absolute top-0 bottom-0 flex flex-col items-center"
                                style={{ left: `${tick.position}%` }}
                            >
                                <div
                                    className={`w-px h-3 ${tick.isNow ? 'bg-primary h-full' : tick.isPast ? 'bg-muted-foreground/30' : 'bg-warning/40'}`}
                                />
                                <span className={`text-[9px] mt-0.5 ${tick.isNow ? 'text-primary font-bold' : tick.isFuture ? 'text-warning' : 'text-muted-foreground'}`}>
                                    {tick.date.getDate()} {tick.date.toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                                {tick.isFuture && (
                                    <span className="text-[8px] text-warning/60">Predicted</span>
                                )}
                            </div>
                        ))}

                        <motion.div
                            className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg shadow-primary/50"
                            style={{ left: `${currentPosition}%` }}
                            onMouseDown={handleMouseDown}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-background" />
                        </motion.div>
                    </div>

                    <div className="flex justify-between mt-2 px-1 text-[10px] text-muted-foreground">
                        <span>← Past</span>
                        <span className="text-primary font-semibold">Present</span>
                        <span className="text-warning">Future (Predictions) →</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TimelineControl;
