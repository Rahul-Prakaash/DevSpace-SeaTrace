import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet.heat';
import { HazardReport, temporalHazardReports, disasterColors } from '@/lib/mockData';
import { useTimelineStore } from '@/lib/useTimelineState';
import { useAuthStore } from '@/lib/useAuthStore';
import { MapStyle } from './MapStyleToggle';
import HazardLegend from './HazardLegend';

const MAP_TILES: Record<MapStyle, { url: string; attribution: string }> = {
    night: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    day: {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap &copy; OpenTopoMap',
    },
};

// Default view: centered on India
const DEFAULT_CENTER: [number, number] = [20.0, 80.0];
const DEFAULT_ZOOM = 5;

interface MapViewProps {
    onSelectReport: (report: HazardReport) => void;
    showHeatmap: boolean;
    selectedType: string | null;
    mapStyle: MapStyle;
}

const MapView = ({ onSelectReport, showHeatmap, mapStyle }: MapViewProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const tileRef = useRef<L.TileLayer | null>(null);
    const heatLayersRef = useRef<any[]>([]);
    const circleLayersRef = useRef<L.CircleMarker[]>([]);
    const glowLayersRef = useRef<L.CircleMarker[]>([]);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const prevRegionRef = useRef<string | null>(null);

    const [visibleTypes, setVisibleTypes] = useState<Set<HazardReport['type']>>(
        new Set(['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'erosion', 'rip_current', 'coastal_flood'])
    );

    const { selectedTimestamp } = useTimelineStore();
    const region = useAuthStore(s => s.region);

    // ── Initialize map ──
    useEffect(() => {
        if (!mapRef.current) {
            // Determine initial view: from saved region or default India center
            let center = DEFAULT_CENTER;
            let zoom = DEFAULT_ZOOM;

            if (region && region.bbox) {
                const [south, west, north, east] = region.bbox;
                center = [(south + north) / 2, (west + east) / 2];
                zoom = 9; // reasonable zoom for a city
            }

            const map = L.map('map', {
                zoomControl: true,
                minZoom: 4,
                maxZoom: 18,
            }).setView(center, zoom);

            const tile = L.tileLayer(MAP_TILES.night.url, {
                attribution: MAP_TILES.night.attribution,
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);

            mapRef.current = map;
            tileRef.current = tile;
            markersLayerRef.current = L.layerGroup().addTo(map);

            // If starting with a region, fit to its bounds
            if (region && region.bbox) {
                const [south, west, north, east] = region.bbox;
                const padFactor = 0.1; // 10% padding
                const latPad = (north - south) * padFactor;
                const lngPad = (east - west) * padFactor;
                map.fitBounds([
                    [south - latPad, west - lngPad],
                    [north + latPad, east + lngPad],
                ]);
                prevRegionRef.current = region.name;
            }
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // ── Fly to region when it changes ──
    useEffect(() => {
        if (!mapRef.current) return;

        if (region && region.bbox) {
            // Only fly if region actually changed
            if (prevRegionRef.current !== region.name) {
                const [south, west, north, east] = region.bbox;
                const padFactor = 0.1; // 10% padding for context (~1.2x total)
                const latPad = (north - south) * padFactor;
                const lngPad = (east - west) * padFactor;

                mapRef.current.flyToBounds(
                    [
                        [south - latPad, west - lngPad],
                        [north + latPad, east + lngPad],
                    ],
                    { animate: true, duration: 1.5 }
                );
                prevRegionRef.current = region.name;
            }
        } else if (prevRegionRef.current !== null) {
            // Region cleared — fly back to India overview
            mapRef.current.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.5 });
            prevRegionRef.current = null;
        }
    }, [region]);

    // ── Switch map style ──
    useEffect(() => {
        if (!mapRef.current || !tileRef.current) return;
        tileRef.current.setUrl(MAP_TILES[mapStyle].url);
    }, [mapStyle]);

    // ── Main rendering: circles (agency) + heatmap (news/social) ──
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear previous layers
        heatLayersRef.current.forEach(l => mapRef.current!.removeLayer(l));
        heatLayersRef.current = [];
        circleLayersRef.current.forEach(l => mapRef.current!.removeLayer(l));
        circleLayersRef.current = [];
        glowLayersRef.current.forEach(l => mapRef.current!.removeLayer(l));
        glowLayersRef.current = [];

        if (!showHeatmap) return;

        // Filter by timeline: only show reports that are currently ACTIVE
        const filtered = temporalHazardReports.filter(r => {
            const reportTime = new Date(r.timestamp).getTime();
            if (reportTime > selectedTimestamp.getTime()) return false;
            if (!visibleTypes.has(r.type)) return false;

            const durationMs = (r.durationHours || 48) * 60 * 60 * 1000;
            const expiryTime = reportTime + durationMs;
            if (selectedTimestamp.getTime() > expiryTime) return false;

            return true;
        });

        // Split into categories
        const agencyReports = filtered.filter(r => r.source === 'agency' && !r.isPrediction);
        const predictionReports = filtered.filter(r => r.isPrediction);
        const verifiedNews = filtered.filter(r =>
            (r.source === 'news' || r.source === 'social') && r.verificationStatus === 'verified');
        const ambiguousNews = filtered.filter(r =>
            (r.source === 'news' || r.source === 'social') && r.verificationStatus === 'ambiguous');

        // ════════════════════════════════════════════════
        // 1. HEATMAP HUES: News/social data with glow
        // ════════════════════════════════════════════════

        const verifiedByType: Record<string, HazardReport[]> = {};
        verifiedNews.forEach(r => {
            if (!verifiedByType[r.type]) verifiedByType[r.type] = [];
            verifiedByType[r.type].push(r);
        });

        Object.entries(verifiedByType).forEach(([type, reports]) => {
            const colors = disasterColors[type as HazardReport['type']];
            if (!colors) return;

            const points = reports.map(r => {
                const intensity = r.severity === 'critical' ? 1.0
                    : r.severity === 'high' ? 0.8
                        : r.severity === 'medium' ? 0.55
                            : 0.35;
                return [r.lat, r.lng, intensity] as [number, number, number];
            });

            if (points.length > 0) {
                // @ts-ignore
                const heatLayer = (L as any).heatLayer(points, {
                    radius: 40,
                    blur: 30,
                    maxZoom: 10,
                    max: 1.0,
                    gradient: {
                        0.0: 'transparent',
                        0.2: colors.solid.replace('0.7', '0.15'),
                        0.4: colors.solid.replace('0.7', '0.35'),
                        0.6: colors.solid.replace('0.7', '0.55'),
                        0.8: colors.solid,
                        1.0: colors.border,
                    },
                }).addTo(mapRef.current!);
                heatLayersRef.current.push(heatLayer);
            }
        });

        // Ambiguous news — much fainter heatmap
        const ambiguousByType: Record<string, HazardReport[]> = {};
        ambiguousNews.forEach(r => {
            if (!ambiguousByType[r.type]) ambiguousByType[r.type] = [];
            ambiguousByType[r.type].push(r);
        });

        Object.entries(ambiguousByType).forEach(([type, reports]) => {
            const colors = disasterColors[type as HazardReport['type']];
            if (!colors) return;

            const points = reports.map(r => {
                const intensity = r.severity === 'critical' ? 0.5
                    : r.severity === 'high' ? 0.35
                        : r.severity === 'medium' ? 0.2
                            : 0.1;
                return [r.lat, r.lng, intensity] as [number, number, number];
            });

            if (points.length > 0) {
                // @ts-ignore
                const heatLayer = (L as any).heatLayer(points, {
                    radius: 30,
                    blur: 40,
                    maxZoom: 10,
                    max: 1.0,
                    gradient: {
                        0.0: 'transparent',
                        0.3: colors.solid.replace('0.7', '0.08'),
                        0.6: colors.solid.replace('0.7', '0.18'),
                        1.0: colors.solid.replace('0.7', '0.3'),
                    },
                }).addTo(mapRef.current!);
                heatLayersRef.current.push(heatLayer);
            }
        });

        // ════════════════════════════════════════════════
        // 2. CIRCLE MARKERS: Agency-verified data ONLY
        // ════════════════════════════════════════════════

        agencyReports.forEach(r => {
            const colors = disasterColors[r.type];
            if (!colors) return;

            const radius = r.severity === 'critical' ? 10
                : r.severity === 'high' ? 8
                    : r.severity === 'medium' ? 6
                        : 5;

            // Outer glow ring
            const glow = L.circleMarker([r.lat, r.lng], {
                radius: radius + 6,
                fillColor: colors.border,
                fillOpacity: 0.12,
                color: colors.border,
                weight: 0,
                opacity: 0,
            }).addTo(mapRef.current!);
            glowLayersRef.current.push(glow);

            // Main circle
            const circle = L.circleMarker([r.lat, r.lng], {
                radius,
                fillColor: colors.border,
                fillOpacity: 0.35,
                color: colors.border,
                weight: 1,
                opacity: 0.85,
            }).addTo(mapRef.current!);

            circle.bindPopup(`
                <div style="font-family: Inter, sans-serif; padding: 6px; min-width: 200px;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                        <span style="background:${colors.border}; width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
                        <strong>${r.title}</strong>
                    </div>
                    <span style="color: ${colors.border}; font-weight: 600; text-transform: uppercase; font-size: 11px;">
                        ${r.type.replace('_', ' ')} &mdash; ${r.severity}
                    </span>
                    <br/><span style="font-size: 10px; color: #10b981; font-weight:500;">&#x2713; Verified Agency Report</span>
                    ${r.state ? `<br/><span style="font-size: 11px; opacity: 0.6;">${r.state}</span>` : ''}
                    <br/><span style="font-size: 11px; opacity: 0.7;">${r.description}</span>
                    <br/><span style="font-size: 10px; opacity: 0.5;">${r.reporter} &bull; ${new Date(r.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            `);

            circle.on('click', () => onSelectReport(r));
            circleLayersRef.current.push(circle);
        });

        // ════════════════════════════════════════════════
        // 3. PREDICTION MARKERS: Dashed border circles
        // ════════════════════════════════════════════════

        predictionReports.forEach(r => {
            const colors = disasterColors[r.type];
            if (!colors) return;

            const radius = r.severity === 'critical' ? 10
                : r.severity === 'high' ? 8
                    : r.severity === 'medium' ? 6
                        : 5;

            const circle = L.circleMarker([r.lat, r.lng], {
                radius,
                fillColor: colors.border,
                fillOpacity: 0.12,
                color: colors.border,
                weight: 1,
                opacity: 0.5,
                dashArray: '5 3',
            }).addTo(mapRef.current!);

            circle.bindPopup(`
                <div style="font-family: Inter, sans-serif; padding: 6px; min-width: 200px;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                        <span style="background:${colors.border}; width:8px; height:8px; border-radius:50%; display:inline-block; opacity:0.5;"></span>
                        <strong>${r.title}</strong>
                    </div>
                    <span style="color: ${colors.border}; font-weight: 600; text-transform: uppercase; font-size: 11px;">
                        ${r.type.replace('_', ' ')} &mdash; ${r.severity}
                    </span>
                    <br/><span style="font-size: 10px; color: #f59e0b; font-weight:500;">&#x26A0; ML Prediction</span>
                    ${r.state ? `<br/><span style="font-size: 11px; opacity: 0.6;">${r.state}</span>` : ''}
                    <br/><span style="font-size: 11px; opacity: 0.7;">${r.description}</span>
                </div>
            `);

            circle.on('click', () => onSelectReport(r));
            circleLayersRef.current.push(circle);
        });

    }, [showHeatmap, selectedTimestamp, visibleTypes, onSelectReport]);

    const handleToggleType = (type: HazardReport['type']) => {
        setVisibleTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    return (
        <div className="relative w-full h-full">
            <div id="map" className="w-full h-full" />
            <HazardLegend visibleTypes={visibleTypes} onToggleType={handleToggleType} />
        </div>
    );
};

export default MapView;
