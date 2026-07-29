'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTrackingStore, TIPO_RESIDUO_LABELS, TIPO_RESIDUO_COLORS, type VehiclePosition } from '@/store/tracking-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  ShieldCheck,
  Truck,
  AlertTriangle,
  TrendingUp,
  Map,
} from 'lucide-react';

export default function AdminPanel() {
  const { relatos, setRelatos, veiculos, setVeiculos } = useTrackingStore();
  const safeRelatos = Array.isArray(relatos) ? relatos : [];
  const safeVeiculos = Array.isArray(veiculos) ? veiculos : [];
  const [routeHistory, setRouteHistory] = useState<VehiclePosition[]>([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const adminMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetch('/api/relatos')
      .then((r) => r.json())
      .then(setRelatos)
      .catch(console.error);
    fetch('/api/veiculos')
      .then((r) => r.json())
      .then(setVeiculos)
      .catch(console.error);
  }, [setRelatos, setVeiculos]);

  // Connect WebSocket for history
  useEffect(() => {
    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
 console.log('[Admin] WebSocket connected');
    });

    socket.on('history-response', (data: { veiculoId: number; positions: VehiclePosition[] }) => {
      if (data.veiculoId === selectedVeiculo) {
        setRouteHistory(data.positions);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedVeiculo]);

  // Request history when vehicle selected
  useEffect(() => {
    if (socketRef.current && selectedVeiculo !== null) {
      socketRef.current.emit('get-history', { veiculoId: selectedVeiculo });
    }
  }, [selectedVeiculo]);

  // Draw route on map
  const drawRoute = useCallback(async () => {
    if (routeHistory.length < 2) return;

    const L = (await import('leaflet')).default;

    if (!adminMapRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView(
        [routeHistory[0].lat, routeHistory[0].lng],
        15
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      adminMapRef.current = map;
    }

    if (adminMapRef.current) {
      if (routeLayerRef.current) {
        adminMapRef.current.removeLayer(routeLayerRef.current);
      }

      const latlngs = routeHistory.map((p) => [p.lat, p.lng] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: '#16a34a',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(adminMapRef.current);

      // Add start and end markers
      if (latlngs.length > 0) {
        L.circleMarker(latlngs[0], { radius: 8, color: 'green', fillColor: 'green', fillOpacity: 1 })
          .addTo(adminMapRef.current)
          .bindPopup('Início');
        L.circleMarker(latlngs[latlngs.length - 1], { radius: 8, color: 'red', fillColor: 'red', fillOpacity: 1 })
          .addTo(adminMapRef.current)
          .bindPopup('Posição atual');
      }

      routeLayerRef.current = polyline;
      adminMapRef.current.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    }
  }, [routeHistory]);

  useEffect(() => {
    if (routeHistory.length >= 2) {
      drawRoute();
    }
  }, [routeHistory, drawRoute]);

  // Stats
  const totalRelatos = safeRelatos.length;
  const pendentes = safeRelatos.filter((r) => r.status === 'pendente').length;
  const resolvidos = safeRelatos.filter((r) => r.status === 'resolvido').length;
  const emAnalise = safeRelatos.filter((r) => r.status === 'em_analise').length;
  const veiculosAtivos = safeVeiculos.filter((v) => v.ativo).length;

  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch(`/api/relatos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setRelatos(
      safeRelatos.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Painel de Gestão</h2>
        <Badge variant="secondary" className="ml-2">Prefeitura</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Relatos Totais</p>
                <p className="text-2xl font-bold">{totalRelatos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-orange-500">{pendentes}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{resolvidos}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Caminhões Ativos</p>
                <p className="text-2xl font-bold">{veiculosAtivos}</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route visualization */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              Rotas Percorridas
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {safeVeiculos.filter((v) => v.ativo).map((v) => (
                <Button
                  key={v.id}
                  variant={selectedVeiculo === v.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedVeiculo(selectedVeiculo === v.id ? null : v.id)}
                  className="gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" />
                  {v.nome}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedVeiculo ? (
            routeHistory.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Inicie a simulação no mapa para visualizar a rota.</p>
                <p className="text-xs mt-1">São necessários pelo menos 2 pontos de posição.</p>
              </div>
            ) : (
              <div className="h-[350px] rounded-xl overflow-hidden border">
                <div ref={mapRef} className="w-full h-full" />
              </div>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Selecione um veículo para visualizar a rota percorrida.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatos table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Relatos de Problemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeRelatos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum relato registrado.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="max-w-[200px]">Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeRelatos.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-xs capitalize">
                        {r.tipoProblema.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {r.descricao}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === 'resolvido' ? 'default' :
                            r.status === 'em_analise' ? 'secondary' : 'outline'
                          }
                          className={`text-xs ${
                            r.status === 'resolvido' ? 'bg-green-100 text-green-700' :
                            r.status === 'em_analise' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(r.criadoEm).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status !== 'resolvido' && (
                          <div className="flex gap-1 justify-end">
                            {r.status === 'pendente' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => handleUpdateStatus(r.id, 'em_analise')}
                              >
                                Analisar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="default"
                              className="text-xs h-7"
                              onClick={() => handleUpdateStatus(r.id, 'resolvido')}
                            >
                              Resolver
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}