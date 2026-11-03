import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import {
  Layers,
  MapPin,
  Crosshair,
  Flame,
  Activity,
  Compass,
  Filter,
  RotateCcw,
  Info,
  CheckCircle2
} from 'lucide-react';
import type { HotspotCluster, RoadSegment, Accident } from '../types';
import {
  MAHARASHTRA_CENTER,
  MAHARASHTRA_DEFAULT_ZOOM,
  MAHARASHTRA_DISTRICTS,
  MAHARASHTRA_EXPRESSWAYS,
} from '../data/maharashtraGeo';
import type { MaharashtraDistrict } from '../data/maharashtraGeo';
import { useTheme } from '../context/ThemeContext';

interface LeafletMapProps {
  hotspots?: HotspotCluster[];
  roadSegments?: RoadSegment[];
  accidents?: Accident[];
  selectedDistrictId?: string;
  onDistrictSelect?: (district: MaharashtraDistrict) => void;
  onHotspotSelect?: (hotspot: HotspotCluster) => void;
  height?: string;
  showFiltersPanel?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  hotspots = [],
  roadSegments = [],
  accidents = [],
  selectedDistrictId = 'all',
  onDistrictSelect,
  onHotspotSelect,
  height = '560px',
  showFiltersPanel = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const districtsLayerRef = useRef<L.LayerGroup | null>(null);
  const expresswaysLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer Visibility Controls
  const { theme } = useTheme();
  const [activeBasemap, setActiveBasemap] = useState<'esri_dark' | 'osm' | 'esri_street'>(
    theme === 'light' ? 'osm' : 'esri_dark'
  );

  useEffect(() => {
    setActiveBasemap(theme === 'light' ? 'osm' : 'esri_dark');
  }, [theme]);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showDistricts, setShowDistricts] = useState<boolean>(true);
  const [showExpressways, setShowExpressways] = useState<boolean>(true);

  // Filter States
  const [currentDistrict, setCurrentDistrict] = useState<string>(selectedDistrictId);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Basemap tile URLs - 100% Keyless, High-Performance, Zero Watermarks
  const tileProviders = {
    esri_dark: {
      name: 'Esri Dark Gray Canvas',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
    },
    osm: {
      name: 'OpenStreetMap (Standard)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    esri_street: {
      name: 'Esri World Street',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, USGS, METI',
      maxZoom: 18,
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MAHARASHTRA_CENTER,
      zoom: MAHARASHTRA_DEFAULT_ZOOM,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer (Keyless, No Watermarks)
    const activeProvider = tileProviders.esri_dark;
    const tileLayer = L.tileLayer(activeProvider.url, {
      attribution: activeProvider.attribution,
      maxZoom: activeProvider.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Initialize layer groups
    districtsLayerRef.current = L.layerGroup().addTo(map);
    expresswaysLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);

    // Marker cluster group with brand orange style
    clusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });
    map.addLayer(clusterGroupRef.current);

    // Coordinate Tracker
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lng: parseFloat(e.latlng.lng.toFixed(4)),
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Provider
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = tileProviders[activeBasemap];
    tileLayerRef.current.setUrl(provider.url);
  }, [activeBasemap]);

  // Render Maharashtra Districts Markers & Polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !districtsLayerRef.current) return;
    const group = districtsLayerRef.current;
    group.clearLayers();

    if (!showDistricts) return;

    MAHARASHTRA_DISTRICTS.forEach((dist) => {
      // Circle marker for each district headquarters
      const isSelected = currentDistrict === dist.id;
      const marker = L.circleMarker(dist.center, {
        radius: isSelected ? 9 : dist.hasAccidentData ? 7 : 5,
        fillColor: dist.hasAccidentData ? '#FF7A00' : '#4A5C6A',
        color: isSelected ? '#CCD0CF' : '#253745',
        weight: isSelected ? 2.5 : 1.5,
        opacity: 0.9,
        fillOpacity: dist.hasAccidentData ? 0.85 : 0.6,
      });

      const popupContent = `
        <div style="font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; color: #CCD0CF; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #4A5C6A; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #FF7A00; font-size: 13px;">${dist.name}</strong>
            <span style="font-size: 10px; color: #9BA8AB; font-family: monospace;">${dist.marathiName}</span>
          </div>
          <div style="font-size: 11px; color: #9BA8AB; margin-bottom: 4px;">Division: <strong style="color: #CCD0CF;">${dist.division}</strong></div>
          <div style="font-size: 11px; margin-bottom: 4px;">
            Accident Records: <strong style="color: ${dist.hasAccidentData ? '#10b981' : '#9BA8AB'};">${dist.accidentRecordsCount > 0 ? dist.accidentRecordsCount.toLocaleString() + ' (Demonstration)' : '0 (Awaiting FIR Upload)'}</strong>
          </div>
          <div style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #253745; color: ${dist.hasAccidentData ? '#10b981' : '#FF7A00'}; display: inline-block; margin-top: 4px; border: 1px solid #4A5C6A;">
            ${dist.statusLabel}
          </div>
          <div style="font-size: 10px; color: #9BA8AB; margin-top: 6px; line-height: 1.3;">
            ${dist.description}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        handleDistrictChange(dist.id);
      });

      group.addLayer(marker);
    });
  }, [showDistricts, currentDistrict]);

  // Render State-Wide Expressways (Samruddhi Mahamarg, Mumbai-Pune, etc.)
  useEffect(() => {
    if (!mapInstanceRef.current || !expresswaysLayerRef.current) return;
    const group = expresswaysLayerRef.current;
    group.clearLayers();

    if (!showExpressways) return;

    MAHARASHTRA_EXPRESSWAYS.forEach((exp) => {
      const polyline = L.polyline(exp.points as L.LatLngExpression[], {
        color: '#FF7A00',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 6',
      });

      polyline.bindPopup(`
        <div style="font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; color: #CCD0CF; min-width: 220px;">
          <div style="font-weight: bold; color: #FF7A00; border-bottom: 1px solid #4A5C6A; padding-bottom: 4px; margin-bottom: 6px;">
            ${exp.shortName}
          </div>
          <div style="font-size: 11px; color: #9BA8AB;">Length: <strong style="color: #CCD0CF;">${exp.lengthKm} km</strong> • Lanes: <strong style="color: #CCD0CF;">${exp.lanes}</strong></div>
          <div style="font-size: 11px; color: #9BA8AB;">Speed Limit: <strong style="color: #CCD0CF;">${exp.speedLimit} km/h</strong></div>
          <div style="font-size: 10px; color: #9BA8AB; margin-top: 6px;">
            Traverses: ${exp.districtsTraversed.join(', ')}
          </div>
        </div>
      `);

      group.addLayer(polyline);
    });
  }, [showExpressways]);

  // Render Road Corridors
  useEffect(() => {
    if (!mapInstanceRef.current || !corridorsLayerRef.current) return;
    const group = corridorsLayerRef.current;
    group.clearLayers();

    if (!showCorridors || roadSegments.length === 0) return;

    roadSegments.forEach((seg) => {
      const start: [number, number] = [seg.start_lat, seg.start_lon];
      const end: [number, number] = [seg.end_lat, seg.end_lon];

      const getCorridorColor = (risk: string) => {
        switch (risk) {
          case 'Critical': return '#ef4444';
          case 'High': return '#f97316';
          case 'Medium': return '#f59e0b';
          default: return '#10b981';
        }
      };

      const color = getCorridorColor(seg.risk_level);
      const poly = L.polyline([start, end], {
        color: color,
        weight: 5,
        opacity: 0.85,
      });

      poly.bindPopup(`
        <div style="font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; color: #CCD0CF; min-width: 200px;">
          <div style="font-weight: bold; color: ${color}; border-bottom: 1px solid #4A5C6A; padding-bottom: 4px; margin-bottom: 6px;">
            ${seg.corridor_name} - ${seg.segment_name}
          </div>
          <div style="font-size: 11px; color: #9BA8AB;">Zone: <strong style="color: #CCD0CF;">${seg.zone}</strong></div>
          <div style="font-size: 11px; color: #9BA8AB;">Risk Index: <strong style="color: ${color};">${seg.historical_risk_score}/100 (${seg.risk_level})</strong></div>
          <div style="font-size: 11px; color: #9BA8AB;">Daily Volume: <strong style="color: #CCD0CF;">${seg.daily_avg_volume.toLocaleString()} veh/day</strong></div>
          <div style="font-size: 11px; color: #9BA8AB;">Speed Limit: <strong style="color: #CCD0CF;">${seg.speed_limit || 60} km/h</strong></div>
        </div>
      `);

      group.addLayer(poly);
    });
  }, [showCorridors, roadSegments]);

  // Render Hotspots (DBSCAN halos and clusters)
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;
    const group = hotspotsLayerRef.current;
    group.clearLayers();

    if (!showHotspots || hotspots.length === 0) return;

    const filteredHotspots = hotspots.filter((h) => {
      if (riskFilter !== 'all' && h.risk_level.toLowerCase() !== riskFilter.toLowerCase()) return false;
      return true;
    });

    filteredHotspots.forEach((hs) => {
      const getHotspotColor = (risk: string) => {
        switch (risk) {
          case 'Critical': return '#ef4444';
          case 'High': return '#f97316';
          case 'Medium': return '#f59e0b';
          default: return '#10b981';
        }
      };

      const color = getHotspotColor(hs.risk_level);

      // DBSCAN spatial halo circle
      const halo = L.circle([hs.center_latitude, hs.center_longitude], {
        radius: hs.radius_meters || 650,
        color: color,
        weight: 1.5,
        opacity: 0.7,
        fillColor: color,
        fillOpacity: 0.18,
      });

      // Center core point
      const core = L.circleMarker([hs.center_latitude, hs.center_longitude], {
        radius: 6,
        color: '#06141B',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      });

      const popupHtml = `
        <div style="font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; color: #CCD0CF; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #4A5C6A; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: ${color}; font-size: 13px;">Hotspot Cluster #${hs.cluster_id}</strong>
            <span style="font-size: 10px; font-weight: bold; background: ${color}22; color: ${color}; padding: 1px 6px; border-radius: 4px; border: 1px solid ${color}44;">
              ${hs.risk_level}
            </span>
          </div>
          <div style="font-size: 11px; color: #9BA8AB; margin-bottom: 4px;">Corridor: <strong style="color: #CCD0CF;">${hs.primary_corridor}</strong></div>
          <div style="font-size: 11px; color: #9BA8AB; margin-bottom: 4px;">Primary Cause: <strong style="color: #CCD0CF;">${hs.prominent_cause}</strong></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; font-family: monospace; font-size: 11px;">
            <div style="background: #253745; padding: 4px; border-radius: 3px; border: 1px solid #4A5C6A;">
              <span style="color: #9BA8AB; font-size: 9px; display: block;">INCIDENTS</span>
              <strong style="color: #CCD0CF;">${hs.accident_count}</strong>
            </div>
            <div style="background: #253745; padding: 4px; border-radius: 3px; border: 1px solid #4A5C6A;">
              <span style="color: #9BA8AB; font-size: 9px; display: block;">FATALITIES</span>
              <strong style="color: #ef4444;">${hs.fatal_count}</strong>
            </div>
          </div>
          <div style="font-size: 10px; color: #9BA8AB; margin-top: 6px; font-family: monospace;">
            Coord: ${hs.center_latitude.toFixed(4)}°N, ${hs.center_longitude.toFixed(4)}°E
          </div>
        </div>
      `;

      halo.bindPopup(popupHtml);
      core.bindPopup(popupHtml);

      halo.on('click', () => onHotspotSelect && onHotspotSelect(hs));
      core.on('click', () => onHotspotSelect && onHotspotSelect(hs));

      group.addLayer(halo);
      group.addLayer(core);
    });
  }, [showHotspots, hotspots, riskFilter, onHotspotSelect]);

  // Render Accident Markers & Marker Clustering
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;
    const cluster = clusterGroupRef.current;
    cluster.clearLayers();

    if (!showClusters || accidents.length === 0) return;

    const filteredAccidents = accidents.filter((acc) => {
      if (severityFilter !== 'all' && acc.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
      return true;
    });

    filteredAccidents.forEach((acc) => {
      const getSeverityColor = (sev: string) => {
        switch (sev) {
          case 'Fatal': return '#ef4444';
          case 'Serious': return '#f59e0b';
          default: return '#10b981';
        }
      };

      const color = getSeverityColor(acc.severity);
      const marker = L.circleMarker([acc.latitude, acc.longitude], {
        radius: acc.severity === 'Fatal' ? 6 : acc.severity === 'Serious' ? 5 : 4,
        color: '#06141B',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      });

      marker.bindPopup(`
        <div style="font-family: 'IBM Plex Sans', sans-serif; font-size: 12px; color: #CCD0CF; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #4A5C6A; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: ${color};">${acc.severity} Collision</strong>
            <span style="font-size: 10px; font-family: monospace; color: #9BA8AB;">${acc.incident_id}</span>
          </div>
          <div style="font-size: 11px; color: #9BA8AB;">Location: <strong style="color: #CCD0CF;">${acc.location_name}</strong></div>
          <div style="font-size: 11px; color: #9BA8AB;">Corridor: <strong style="color: #CCD0CF;">${acc.corridor}</strong> (${acc.zone})</div>
          <div style="font-size: 11px; color: #9BA8AB;">Primary Cause: <strong style="color: #CCD0CF;">${acc.primary_cause}</strong></div>
          <div style="font-size: 11px; color: #9BA8AB;">Weather / Surface: <strong style="color: #CCD0CF;">${acc.weather_condition} / ${acc.road_surface}</strong></div>
          <div style="font-size: 10px; color: #9BA8AB; margin-top: 6px; font-family: monospace;">
            Casualties: ${acc.casualties} • Fatalities: ${acc.fatalities} • Risk: ${(acc.risk_score * 100).toFixed(0)}/100
          </div>
        </div>
      `);

      cluster.addLayer(marker);
    });
  }, [showClusters, accidents, severityFilter]);

  // Render Heatmap Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && accidents.length > 0) {
      const heatPoints = accidents.map((acc) => {
        const intensity = acc.severity === 'Fatal' ? 1.0 : acc.severity === 'Serious' ? 0.6 : 0.3;
        return [acc.latitude, acc.longitude, intensity] as [number, number, number];
      });

      // @ts-ignore leaflet-heat untyped plugin method
      const heat = L.heatLayer(heatPoints, {
        radius: 20,
        blur: 15,
        maxZoom: 14,
        gradient: {
          0.2: '#10b981',
          0.5: '#f59e0b',
          0.8: '#f97316',
          1.0: '#ef4444',
        },
      });

      heat.addTo(map);
      heatLayerRef.current = heat;
    }
  }, [showHeatmap, accidents]);

  // Handle District Selection Camera FlyTo
  const handleDistrictChange = (distId: string) => {
    setCurrentDistrict(distId);
    if (!mapInstanceRef.current) return;

    if (distId === 'all') {
      mapInstanceRef.current.flyTo(MAHARASHTRA_CENTER, MAHARASHTRA_DEFAULT_ZOOM, { duration: 1.2 });
      return;
    }

    const targetDist = MAHARASHTRA_DISTRICTS.find((d) => d.id === distId);
    if (targetDist) {
      mapInstanceRef.current.flyTo(targetDist.center, targetDist.zoomLevel, { duration: 1.2 });
      if (onDistrictSelect) {
        onDistrictSelect(targetDist);
      }
    }
  };

  const handleResetFilters = () => {
    setCurrentDistrict('all');
    setSeverityFilter('all');
    setRiskFilter('all');
    setShowHotspots(true);
    setShowCorridors(true);
    setShowClusters(true);
    setShowHeatmap(false);
    setShowDistricts(true);
    setShowExpressways(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MAHARASHTRA_CENTER, MAHARASHTRA_DEFAULT_ZOOM, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full rounded border border-[#253745] bg-[#06141B] overflow-hidden select-none" style={{ height }}>
      {/* Central Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Toolbar: Maharashtra District Selector & Layer Switches */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
        {/* District Zoom Dropdown */}
        <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#11212D]/95 border border-[#4A5C6A] shadow-lg backdrop-blur-xs text-xs font-mono">
          <Compass className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span className="text-[#9BA8AB] hidden sm:inline">District:</span>
          <select
            value={currentDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="bg-[#06141B] text-[#CCD0CF] text-xs font-mono rounded px-1.5 py-0.5 border border-[#253745] focus:outline-none focus:border-[#FF7A00]"
          >
            <option value="all">Maharashtra (Statewide Scope)</option>
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.hasAccidentData ? '• [Active Telemetry]' : '• [Ready]'}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#11212D]/95 border border-[#4A5C6A] shadow-lg backdrop-blur-xs text-xs font-mono">
          <span className="text-[#9BA8AB]">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#06141B] text-[#CCD0CF] text-xs font-mono rounded px-1.5 py-0.5 border border-[#253745] focus:outline-none focus:border-[#FF7A00]"
          >
            <option value="all">All Severities</option>
            <option value="fatal">Fatal Collisions</option>
            <option value="serious">Serious Collisions</option>
            <option value="slight">Slight Collisions</option>
          </select>
        </div>

        {/* Reset View Button */}
        <button
          onClick={handleResetFilters}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#11212D]/95 hover:bg-[#253745] border border-[#4A5C6A] text-[#CCD0CF] text-xs font-mono transition-colors shadow-lg"
          title="Reset Map to Maharashtra Extent & Clear Filters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Floating Right Control: Basemap & Visualization Modes */}
      <div className="absolute top-14 right-3 z-20 flex flex-col items-end space-y-2">
        {/* Layer Toggles Panel */}
        <div className="p-2.5 rounded bg-[#11212D]/95 border border-[#4A5C6A] shadow-xl backdrop-blur-xs text-xs font-mono space-y-1.5 w-44">
          <div className="flex items-center justify-between pb-1 border-b border-[#253745] text-[10px] text-[#9BA8AB] uppercase font-bold tracking-wider">
            <span>GIS Map Layers</span>
            <Layers className="w-3.5 h-3.5 text-[#FF7A00]" />
          </div>

          <label className="flex items-center justify-between cursor-pointer text-[#CCD0CF] hover:text-white">
            <span className="text-[11px]">DBSCAN Hotspots</span>
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="accent-[#FF7A00]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-[#CCD0CF] hover:text-white">
            <span className="text-[11px]">Accident Clusters</span>
            <input
              type="checkbox"
              checked={showClusters}
              onChange={(e) => setShowClusters(e.target.checked)}
              className="accent-[#FF7A00]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-[#CCD0CF] hover:text-white">
            <span className="text-[11px]">Density Heatmap</span>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-[#FF7A00]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-[#CCD0CF] hover:text-white">
            <span className="text-[11px]">Arterial Corridors</span>
            <input
              type="checkbox"
              checked={showCorridors}
              onChange={(e) => setShowCorridors(e.target.checked)}
              className="accent-[#FF7A00]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-[#CCD0CF] hover:text-white">
            <span className="text-[11px]">State Expressways</span>
            <input
              type="checkbox"
              checked={showExpressways}
              onChange={(e) => setShowExpressways(e.target.checked)}
              className="accent-[#FF7A00]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-[#CCD0CF] hover:text-white">
            <span className="text-[11px]">District Nodes</span>
            <input
              type="checkbox"
              checked={showDistricts}
              onChange={(e) => setShowDistricts(e.target.checked)}
              className="accent-[#FF7A00]"
            />
          </label>

          {/* Basemap Selection */}
          <div className="pt-1.5 border-t border-[#253745]">
            <span className="text-[9px] text-[#9BA8AB] uppercase tracking-wider block mb-1">Tile Provider</span>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <button
                onClick={() => setActiveBasemap('esri_dark')}
                className={`py-0.5 rounded text-center transition-colors ${activeBasemap === 'esri_dark' ? 'bg-[#FF7A00] text-[#06141B] font-bold' : 'bg-[#06141B] text-[#9BA8AB]'}`}
              >
                Esri Dark
              </button>
              <button
                onClick={() => setActiveBasemap('osm')}
                className={`py-0.5 rounded text-center transition-colors ${activeBasemap === 'osm' ? 'bg-[#FF7A00] text-[#06141B] font-bold' : 'bg-[#06141B] text-[#9BA8AB]'}`}
              >
                OSM
              </button>
              <button
                onClick={() => setActiveBasemap('esri_street')}
                className={`py-0.5 rounded text-center transition-colors ${activeBasemap === 'esri_street' ? 'bg-[#FF7A00] text-[#06141B] font-bold' : 'bg-[#06141B] text-[#9BA8AB]'}`}
              >
                Street
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Left: Honest Data Coverage Status Dossier */}
      <div className="absolute bottom-3 left-3 z-20 max-w-sm rounded bg-[#11212D]/95 border border-[#4A5C6A] p-2.5 shadow-xl backdrop-blur-xs text-xs font-mono space-y-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#CCD0CF]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block" />
            <span>Geographical Scope: Maharashtra State</span>
          </span>
          <span className="text-[#FF7A00]">36 Districts</span>
        </div>
        <p className="text-[10px] text-[#9BA8AB] leading-tight">
          • <strong className="text-[#CCD0CF]">Active Demonstration:</strong> Mumbai MMR (Mumbai, Thane, Navi Mumbai) with 3,800 validated FIR accident records.<br />
          • <strong className="text-[#CCD0CF]">Other Districts:</strong> Pune, Nashik, Nagpur, etc. are spatially indexed and ready for FIR batch upload.
        </p>
      </div>

      {/* Floating Bottom Right: WGS84 Precision Tracker & Severity Legend */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end space-y-1.5">
        {/* Severity Legend */}
        <div className="flex items-center space-x-3 px-3 py-1 rounded bg-[#11212D]/95 border border-[#4A5C6A] shadow-lg backdrop-blur-xs text-[10px] font-mono">
          <span className="text-[#9BA8AB] uppercase">Risk:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[#CCD0CF]">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-[#CCD0CF]">Med</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
            <span className="text-[#CCD0CF]">High</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-[#CCD0CF]">Critical</span>
          </div>
        </div>

        {/* WGS84 Cursor Coordinate Readout */}
        {cursorCoords && (
          <div className="px-2 py-0.5 rounded bg-[#06141B]/90 border border-[#253745] text-[9px] font-mono text-[#9BA8AB]">
            WGS84: {cursorCoords.lat}°N, {cursorCoords.lng}°E
          </div>
        )}
      </div>
    </div>
  );
};
