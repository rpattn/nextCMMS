"use client";

import React, { useEffect, useMemo, useState } from 'react';

type Coords = { lat: number; lng: number };
type LocationPoint = { id: number; title: string; address?: string; coordinates: Coords };

export default function BasicMap({
  dimensions,
  locations = [],
}: {
  dimensions?: { width: number; height: number };
  locations?: LocationPoint[];
}) {
  const [ready, setReady] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [reactLeaflet, setReactLeaflet] = useState<any>(null);

  useEffect(() => {
    // Inject Leaflet CSS from CDN to avoid local bundling config
    const id = 'leaflet-css-cdn';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    let ok = true;
    (async () => {
      try {
        const L = await import('leaflet');
        const RL = await import('react-leaflet');
        if (!ok) return;
        setLeaflet(L);
        setReactLeaflet(RL);
        setReady(true);
      } catch (e) {
        console.error('Leaflet not available', e);
        setReady(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  const defaultCenter = useMemo<Coords>(() => ({ lat: 31.1728205, lng: -7.3362482 }), []);
  const center = useMemo<Coords>(() => locations[0]?.coordinates || defaultCenter, [locations, defaultCenter]);

  if (!ready || !reactLeaflet || !leaflet) {
    return (
      <div style={{ width: dimensions?.width ?? '100%', height: dimensions?.height ?? 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mui-palette-text-secondary)' }}>
        Map is loading…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap } = reactLeaflet as any;

  function FitBounds({ points }: { points: Coords[] }) {
    const map = useMap();
    useEffect(() => {
      if (!points?.length) return;
      try {
        // @ts-ignore
        map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [20, 20] });
      } catch {}
    }, [map, points]);
    return null;
  }

  return (
    <div style={{ width: dimensions?.width ?? '100%', height: dimensions?.height ?? 420 }}>
      <MapContainer center={[center.lat, center.lng]} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.length > 0 && <FitBounds points={locations.map((l) => l.coordinates)} />}
        {locations.map((l) => (
          <Marker key={l.id} position={[l.coordinates.lat, l.coordinates.lng]}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <a href={`/app/locations/${l.id}`} style={{ color: 'var(--mui-palette-primary-main)', textDecoration: 'none', fontWeight: 600 }}>{l.title}</a>
                {l.address ? (<div style={{ fontSize: 12, marginTop: 4 }}>{l.address}</div>) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

