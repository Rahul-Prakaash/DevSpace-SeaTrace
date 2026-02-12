import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import MapView from '@/components/MapView';
import HazardSidebar from '@/components/HazardSidebar';
import ReportDetail from '@/components/ReportDetail';
import TimelineControl from '@/components/TimelineControl';
import SocialNotifications from '@/components/SocialNotifications';
import { HazardReport } from '@/lib/mockData';

const Index = () => {
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSelectReport = useCallback((report: HazardReport) => {
        setSelectedReport(report);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Header
                showHeatmap={showHeatmap}
                onToggleHeatmap={() => setShowHeatmap(p => !p)}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(p => !p)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Collapsible sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="h-full border-r border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden flex-shrink-0 z-10"
                        >
                            <div className="w-80 h-full">
                                <HazardSidebar
                                    selectedReport={selectedReport}
                                    onSelectReport={handleSelectReport}
                                    selectedType={selectedType}
                                    onSelectType={setSelectedType}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Map + overlays */}
                <div className="flex-1 relative overflow-hidden">
                    <MapView
                        onSelectReport={handleSelectReport}
                        showHeatmap={showHeatmap}
                        selectedType={selectedType}
                    />

                    {/* Centered stats bar */}
                    <StatsBar />

                    {/* Report detail — top right */}
                    <div className="absolute top-4 right-4 z-[800]">
                        <AnimatePresence>
                            {selectedReport && (
                                <ReportDetail
                                    report={selectedReport}
                                    onClose={() => setSelectedReport(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Timeline control at bottom */}
                    <TimelineControl />

                    {/* Social media notifications — top right */}
                    <SocialNotifications />
                </div>
            </div>
        </div>
    );
};

export default Index;
