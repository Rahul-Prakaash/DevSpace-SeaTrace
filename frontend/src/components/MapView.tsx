import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet.heat';
import { HazardReport, heatmapPoints, temporalHazardReports, disasterColors } from '@/lib/mockData';
import { useTimelineStore } from '@/lib/useTimelineState';
import MapStyleToggle, { MapStyle } from './MapStyleToggle';
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

interface MapViewProps {
    onSelectReport: (report: HazardReport) => void;
    showHeatmap: boolean;
    selectedType: string | null;
}

const MapView = ({ onSelectReport, showHeatmap, selectedType }: MapViewProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const tileRef = useRef<L.TileLayer | null>(null);
    const heatLayersRef = useRef<any[]>([]);
    const circleLayersRef = useRef<L.CircleMarker[]>([]);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);

    const [mapStyle, setMapStyle] = useState<MapStyle>('night');
    const [visibleTypes, setVisibleTypes] = useState<Set<HazardReport['type']>>(
        new Set(['tsunami', 'cyclone', 'storm_surge', 'high_tide', 'erosion', 'rip_current'])
    );

    const { selectedTimestamp } = useTimelineStore();

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) {
            const map = L.map('map', { zoomControl: true }).setView([13.0827, 80.2707], 10);
            const tile = L.tileLayer(MAP_TILES.night.url, {
                attribution: MAP_TILES.night.attribution,
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);
            mapRef.current = map;
            tileRef.current = tile;
            markersLayerRef.current = L.layerGroup().addTo(map);
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Switch map style
    useEffect(() => {
        if (!mapRef.current || !tileRef.current) return;
        const config = MAP_TILES[mapStyle];
        tileRef.current.setUrl(config.url);
    }, [mapStyle]);

    // Update heatmap layers based on timeline position, visible types, etc.
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear old layers
        heatLayersRef.current.forEach(l => mapRef.current!.removeLayer(l));
        heatLayersRef.current = [];
        circleLayersRef.current.forEach(l => mapRef.current!.removeLayer(l));
        circleLayersRef.current = [];

        if (!showHeatmap) return;

        // Filter temporal reports by timeline
        const now = new Date('2026-02-13T00:00:00Z');
        const filtered = temporalHazardReports.filter(r => {
            const reportTime = new Date(r.timestamp);
            if (reportTime > selectedTimestamp) return false;
            if (!visibleTypes.has(r.type)) return false;
            return true;
        });

        // Group by disaster type for color-specific heatmap layers
        const byType: Record<string, HazardReport[]> = {};
        filtered.forEach(r => {
            if (!byType[r.type]) byType[r.type] = [];
            byType[r.type].push(r);
        });

        // Create a heatmap layer per disaster type
        Object.entries(byType).forEach(([type, reports]) => {
            const colors = disasterColors[type as HazardReport['type']];
            if (!colors) return;

            const points = reports.map(r => {
                const intensity = r.severity === 'critical' ? 1.0
                    : r.severity === 'high' ? 0.8
                        : r.severity === 'medium' ? 0.5
                            : 0.3;
                return [r.lat, r.lng, intensity] as [number, number, number];
            });

            if (points.length > 0) {
                // @ts-ignore
                const heatLayer = (L as any).heatLayer(points, {
                    radius: 35,
                    blur: 25,
                    maxZoom: 12,
                    max: 1.0,
                    gradient: {
                        0.0: 'transparent',
                        0.2: colors.solid.replace('0.7', '0.2'),
                        0.5: colors.solid.replace('0.7', '0.5'),
                        0.8: colors.solid,
                        1.0: colors.border,
                    },
                }).addTo(mapRef.current!);
                heatLayersRef.current.push(heatLayer);
            }

            // Add circle markers for individual events
            reports.forEach(r => {
                const isPrediction = r.isPrediction === true;
                const circle = L.circleMarker([r.lat, r.lng], {
                    radius: r.severity === 'critical' ? 14 : r.severity === 'high' ? 11 : r.severity === 'medium' ? 8 : 6,
                    fillColor: colors.border,
                    fillOpacity: 0.3,
                    color: colors.border,
                    weight: isPrediction ? 2 : 2,
                    opacity: 0.8,
                    dashArray: isPrediction ? '6 4' : undefined,
                }).addTo(mapRef.current!);

                circle.bindPopup(`
                    <div style="font-family: Inter, sans-serif; padding: 4px;">
                        <strong>${r.title}</strong><br/>
                        <span style="color: ${colors.border}; font-weight: 600; text-transform: uppercase; font-size: 11px;">
                            ${r.type.replace('_', ' ')} — ${r.severity}
                        </span>
                        ${isPrediction ? '<br/><span style="color: #f59e0b; font-size: 10px;">⚠ ML Prediction</span>' : ''}
                        <br/><span style="font-size: 11px; opacity: 0.7;">${r.description}</span>
                    </div>
                `);

                circleLayersRef.current.push(circle);
            });
        });

        // Also add original heatmap points as a base layer for overall density
        if (heatmapPoints.length > 0) {
            // @ts-ignore
            const baseHeat = (L as any).heatLayer(heatmapPoints, {
                radius: 30,
                blur: 40,
                maxZoom: 12,
                max: 1.0,
                gradient: {
                    0.0: 'transparent',
                    0.3: 'rgba(8, 145, 178, 0.3)',
                    0.5: 'rgba(245, 158, 11, 0.4)',
                    0.7: 'rgba(239, 68, 68, 0.5)',
                    1.0: 'rgba(220, 38, 38, 0.7)',
                },
            }).addTo(mapRef.current!);
            heatLayersRef.current.push(baseHeat);
        }
    }, [showHeatmap, selectedTimestamp, visibleTypes]);

    const handleToggleType = (type: HazardReport['type']) => {
        setVisibleTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    return (
        <div className="relative w-full h-full">
            <div id="map" className="w-full h-full" />
            <MapStyleToggle currentStyle={mapStyle} onStyleChange={setMapStyle} />
            <HazardLegend visibleTypes={visibleTypes} onToggleType={handleToggleType} />
        </div>
    );
};

export default MapView;
