'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Play,
  Square,
  MapPin,
  Wifi,
  WifiOff,
  Navigation,
  Clock,
  Send,
} from 'lucide-react';
import { useTrackingStore, type Veiculo } from '@/store/tracking-store';

export default function MotoristaView() {
  const { veiculos, setVeiculos } = useTrackingStore();
  const safeVeiculos = Array.isArray(veiculos) ? veiculos : [];
  const activeVehicles = safeVeiculos.filter((v) => v.ativo);

  const [selectedVeiculoId, setSelectedVeiculoId] = useState<string>('');
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [positionsSent, setPositionsSent] = useState(0);
  const [lastSentAt, setLastSentAt] = useState<string>('');
  const [error, setError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState('-29.7547');
  const [manualLng, setManualLng] = useState('-57.0829');

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch vehicles
  useEffect(() => {
    if (safeVeiculos.length === 0) {
      fetch('/api/veiculos')
        .then((r) => r.json())
        .then(setVeiculos)
        .catch(console.error);
    }
  }, [safeVeiculos.length, setVeiculos]);

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
      console.log('[Motorista] WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Motorista] WebSocket disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendPosition = useCallback(
    (lat: number, lng: number) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected || !selectedVeiculoId) return;

      const veiculo = safeVeiculos.find((v) => v.id.toString() === selectedVeiculoId);

      socket.emit('update-position', {
        veiculoId: parseInt(selectedVeiculoId),
        lat,
        lng,
        nome: veiculo?.nome || `Veículo ${selectedVeiculoId}`,
        tipoResiduo: veiculo?.tipoResiduo || 'comum',
      });

      setPositionsSent((prev) => prev + 1);
      setLastSentAt(new Date().toLocaleTimeString('pt-BR'));
      setCurrentLat(lat);
      setCurrentLng(lng);
      setError('');
    },
    [selectedVeiculoId, safeVeiculos]
  );

  const startGPSTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste navegador.');
      setManualMode(true);
      return;
    }

    setError('');
    setIsTracking(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendPosition(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('[Motorista] GPS error:', err.message);
        setError(`GPS indisponível (${err.message}). Usando modo manual.`);
        setManualMode(true);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch position every 10 seconds
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        sendPosition(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('[Motorista] GPS watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [sendPosition]);

  const startManualTracking = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Coordenadas inválidas.');
      return;
    }

    setError('');
    setIsTracking(true);
    sendPosition(lat, lng);

    // Send updates every 10 seconds with small random movement
    intervalRef.current = setInterval(() => {
      const dlat = (Math.random() - 0.5) * 0.0006;
      const dlng = (Math.random() - 0.5) * 0.0006;
      setManualLat((prev) => {
        const newLat = (parseFloat(prev) + dlat).toFixed(6);
        setManualLng((prevLng) => {
          const newLng = (parseFloat(prevLng) + dlng).toFixed(6);
          sendPosition(parseFloat(newLat), parseFloat(newLng));
          return newLng;
        });
        return newLat;
      });
    }, 10000);
  }, [manualLat, manualLng, sendPosition]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const handleStart = () => {
    if (manualMode) {
      startManualTracking();
    } else {
      startGPSTracking();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            Painel do Motorista
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Envie sua localização em tempo real para o sistema de rastreamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Vehicle selection card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Selecione seu Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedVeiculoId}
            onValueChange={(val) => {
              setSelectedVeiculoId(val);
              if (isTracking) stopTracking();
            }}
            disabled={isTracking}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <Truck className="h-4 w-4 mr-1.5" />
              <SelectValue placeholder="Escolha o veículo..." />
            </SelectTrigger>
            <SelectContent>
              {activeVehicles.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.nome} ({v.placa || 'sem placa'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant={manualMode ? 'outline' : 'default'}
              size="sm"
              onClick={() => { setManualMode(false); if (isTracking) stopTracking(); }}
              disabled={isTracking}
            >
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              GPS Automático
            </Button>
            <Button
              variant={manualMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setManualMode(true); if (isTracking) stopTracking(); }}
              disabled={isTracking}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Manual / Demo
            </Button>
          </div>

          {error && (
            <div className="bg-orange-500/10 text-orange-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual coordinates input */}
      {manualMode && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coordenadas Manuais (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Latitude</label>
                <input
                  type="text"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  disabled={isTracking}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Longitude</label>
                <input
                  type="text"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  disabled={isTracking}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              As coordenadas sofrerão pequenas variações aleatórias a cada envio para simular o movimento do veículo.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tracking controls */}
      <Card className={isTracking ? 'border-green-500/50 bg-green-50/50' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {isTracking ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                Rastreamento Ativo
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                Rastreamento Inativo
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {!isTracking ? (
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto"
                disabled={!selectedVeiculoId || !isConnected}
                onClick={handleStart}
              >
                <Play className="h-5 w-5" />
                Iniciar Rastreamento
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                className="gap-2 w-full sm:w-auto"
                onClick={stopTracking}
              >
                <Square className="h-5 w-5" />
                Parar Rastreamento
              </Button>
            )}

            {!selectedVeiculoId && (
              <p className="text-sm text-muted-foreground self-center">
                Selecione um veículo acima para começar.
              </p>
            )}
            {!isConnected && selectedVeiculoId && (
              <p className="text-sm text-orange-500 self-center">
                Aguardando conexão com o servidor...
              </p>
            )}
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Latitude</span>
              </div>
              <p className="text-sm font-mono font-medium">
                {currentLat !== null ? currentLat.toFixed(6) : '—'}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Longitude</span>
              </div>
              <p className="text-sm font-mono font-medium">
                {currentLng !== null ? currentLng.toFixed(6) : '—'}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Enviadas</span>
              </div>
              <p className="text-sm font-bold">{positionsSent}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Último Envio</span>
              </div>
              <p className="text-sm font-medium">{lastSentAt || '—'}</p>
            </div>
          </div>

          {isTracking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5" />
              Enviando posição a cada 10 segundos para o veículo {selectedVeiculoId}
              {manualMode && ' (modo manual com variação aleatória)'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Como usar (Manual do Motorista)</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Selecione o veículo que você está operando.</li>
            <li>Escolha o modo: <strong>GPS Automático</strong> (usa o GPS do celular) ou <strong>Manual/Demo</strong> (coordenadas manuais para teste).</li>
            <li>Clique em <strong>Iniciar Rastreamento</strong>.</li>
            <li>Mantenha o navegador aberto. A posição é enviada automaticamente a cada 10 segundos.</li>
            <li>Para parar, clique em <strong>Parar Rastreamento</strong>.</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Nota:</strong> No modo GPS Automático, o navegador pedirá permissão para acessar sua localização.
            Certifique-se de permitir o acesso.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
