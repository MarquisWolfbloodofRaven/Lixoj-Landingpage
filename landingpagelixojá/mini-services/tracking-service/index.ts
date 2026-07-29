import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();

const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store vehicle positions in memory
interface VehiclePosition {
  veiculoId: number;
  lat: number;
  lng: number;
  timestamp: string;
  nome: string;
  tipoResiduo: string;
}

const vehiclePositions = new Map<number, VehiclePosition>();

// Store position history for route tracking
interface PositionHistoryEntry {
  lat: number;
  lng: number;
  timestamp: string;
}

const positionHistory = new Map<number, PositionHistoryEntry[]>();

io.on('connection', (socket) => {
  console.log(`[Tracking] Client connected: ${socket.id}`);

  // Send all current positions to newly connected client
  socket.emit('positions-all', Array.from(vehiclePositions.values()));

  // Driver updates position
  socket.on('update-position', (data: {
    veiculoId: number;
    lat: number;
    lng: number;
    nome?: string;
    tipoResiduo?: string;
  }) => {
    const { veiculoId, lat, lng, nome, tipoResiduo } = data;
    const timestamp = new Date().toISOString();

    // Update current position
    const pos: VehiclePosition = {
      veiculoId,
      lat,
      lng,
      timestamp,
      nome: nome || `Veículo ${veiculoId}`,
      tipoResiduo: tipoResiduo || 'comum',
    };
    vehiclePositions.set(veiculoId, pos);

    // Add to history
    if (!positionHistory.has(veiculoId)) {
      positionHistory.set(veiculoId, []);
    }
    const history = positionHistory.get(veiculoId)!;
    history.push({ lat, lng, timestamp });
    // Keep last 1000 positions
    if (history.length > 1000) {
      positionHistory.set(veiculoId, history.slice(-1000));
    }

    // Broadcast to all clients
    io.emit('position-update', pos);
    console.log(`[Tracking] Vehicle ${veiculoId} updated: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  });

  // Request position history for a vehicle
  socket.on('get-history', (data: { veiculoId: number; date?: string }) => {
    const history = positionHistory.get(data.veiculoId) || [];
    socket.emit('history-response', { veiculoId: data.veiculoId, positions: history });
  });

  // Get all positions
  socket.on('get-all-positions', () => {
    socket.emit('positions-all', Array.from(vehiclePositions.values()));
  });

  socket.on('disconnect', () => {
    console.log(`[Tracking] Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`[Tracking] Socket error (${socket.id}):`, error);
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`[Tracking] WebSocket server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Tracking] Shutting down...');
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Tracking] Shutting down...');
  httpServer.close(() => process.exit(0));
});
