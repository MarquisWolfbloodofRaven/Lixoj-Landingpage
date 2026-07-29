'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTrackingStore, TIPO_RESIDUO_LABELS, TIPO_RESIDUO_COLORS, type VehiclePosition } from '@/store/tracking-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, RefreshCw, LocateFixed } from 'lucide-react';

// Center of Uruguaiana/RS
const CENTER_LAT = -29.7547;
const CENTER_LNG = -57.0829;
const DEFAULT_ZOOM = 14;

export default function TrackingMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    veiculos,
    setVeiculos,
    vehiclePositions,
    updateVehiclePosition,
    setAllPositions,
    isConnected,
    setIsConnected,
    simulationRunning,
    setSimulationRunning,
  } = useTrackingStore();

  const safeVeiculos = Array.isArray(veiculos) ? veiculos : [];

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [followTruck, setFollowTruck] = useState<number | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([CENTER_LAT, CENTER_LNG], DEFAULT_ZOOM);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);
        mapInstanceRef.current = map;
        setLeafletLoaded(true);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch vehicles
  useEffect(() => {
    fetch('/api/veiculos')
      .then((r) => r.json())
      .then(setVeiculos)
      .catch(console.error);
  }, [setVeiculos]);

  // Connect to WebSocket
  useEffect(() => {
    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socket.emit('get-all-positions');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('positions-all', (positions: VehiclePosition[]) => {
      setAllPositions(positions);
      positions.forEach((p) => {
        updateVehiclePosition(p);
      });
    });

    socket.on('position-update', (pos: VehiclePosition) => {
      updateVehiclePosition(pos);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setIsConnected, setAllPositions, updateVehiclePosition]);

  // Update markers on the map
  const updateMarkers = useCallback(async () => {
    if (!mapInstanceRef.current || vehiclePositions.size === 0) return;

    const L = (await import('leaflet')).default;
    const map = mapInstanceRef.current;

    vehiclePositions.forEach((pos, veiculoId) => {
      const existing = markersRef.current.get(veiculoId);
      const color = TIPO_RESIDUO_COLORS[pos.tipoResiduo] || '#16a34a';

      // Create custom icon using divIcon
      const iconHtml = `
        <div style="background:${color}; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          </svg>
        </div>
      `;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-truck-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (existing) {
        existing.setLatLng([pos.lat, pos.lng]);
        existing.setIcon(customIcon);
      } else {
        const marker = L.marker([pos.lat, pos.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px">
              <strong style="font-size:14px">${pos.nome}</strong><br/>
              <span style="color:${color};font-weight:600">${TIPO_RESIDUO_LABELS[pos.tipoResiduo] || pos.tipoResiduo}</span><br/>
              <small>Atualizado: ${new Date(pos.timestamp).toLocaleTimeString('pt-BR')}</small>
            </div>
          `);
        markersRef.current.set(veiculoId, marker);
      }

      // Follow truck if enabled
      if (followTruck === veiculoId) {
        map.panTo([pos.lat, pos.lng]);
      }
    });
  }, [vehiclePositions, followTruck]);

  useEffect(() => {
    if (leafletLoaded) {
      updateMarkers();
    }
  }, [leafletLoaded, vehiclePositions, updateMarkers]);

  // Simulation logic
  const startSimulation = useCallback(() => {
    if (simulationRunning) return;

    // Initialize simulation positions from DB vehicles
    const simPositions = new Map<number, { lat: number; lng: number }>();
    safeVeiculos.forEach((v) => {
      simPositions.set(v.id, { lat: v.lat, lng: v.lng });
    });

    setSimulationRunning(true);

    simulationRef.current = setInterval(() => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;

      simPositions.forEach((pos, veiculoId) => {
        // Simulate small random movement
        const dlat = (Math.random() - 0.5) * 0.0008;
        const dlng = (Math.random() - 0.5) * 0.0008;
        pos.lat += dlat;
        pos.lng += dlng;

        const veiculo = safeVeiculos.find((v) => v.id === veiculoId);
        socket.emit('update-position', {
          veiculoId,
          lat: pos.lat,
          lng: pos.lng,
          nome: veiculo?.nome || `Veículo ${veiculoId}`,
          tipoResiduo: veiculo?.tipoResiduo || 'comum',
        });
      });
    }, 3000);
  }, [simulationRunning, safeVeiculos, setSimulationRunning]);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setSimulationRunning(false);
  }, [setSimulationRunning]);

  const handleRecenter = () => {
    mapInstanceRef.current?.setView([CENTER_LAT, CENTER_LNG], DEFAULT_ZOOM);
    setFollowTruck(null);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />\n          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Rastreamento ao vivo' : 'Desconectado'}
          </span>
          <Badge variant="secondary" className="text-xs">
            {vehiclePositions.size} caminhão(ões) ativo(s)
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant={simulationRunning ? 'destructive' : 'default'}
            size="sm"
            onClick={simulationRunning ? stopSimulation : startSimulation}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${simulationRunning ? 'animate-spin' : ''}`} />
            {simulationRunning ? 'Parar Simulação' : 'Simular Movimento'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRecenter} className="gap-1.5">
            <LocateFixed className="h-3.5 w-3.5" />
            Recentralizar
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative flex-1 min-h-[400px] rounded-xl overflow-hidden border border-border">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="text-center">
              <Truck className="h-8 w-8 animate-bounce mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle list cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {safeVeiculos
          .filter((v) => v.ativo)
          .map((v) => {
            const pos = vehiclePositions.get(v.id);
            const color = TIPO_RESIDUO_COLORS[v.tipoResiduo];
            return (
              <Card
                key={v.id}
                className={`cursor-pointer transition-all hover:shadow-md ${followTruck === v.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setFollowTruck(followTruck === v.id ? null : v.id)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" style={{ color }} />
                      {v.nome}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: color, color }}
                    >
                      {TIPO_RESIDUO_LABELS[v.tipoResiduo]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Placa: {v.placa || 'N/A'}</p>
                    {pos ? (
                      <p>
                        Última posição: {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                        <br />
                        <span className="text-xs">
                          {new Date(pos.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </p>
                    ) : (
                      <p className="text-orange-500">Aguardando posição...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-medium text-muted-foreground">Legenda:</span>
            {Object.entries(TIPO_RESIDUO_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TIPO_RESIDUO_COLORS[key] }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}