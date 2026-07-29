import { create } from 'zustand';

export interface VehiclePosition {
  veiculoId: number;
  lat: number;
  lng: number;
  timestamp: string;
  nome: string;
  tipoResiduo: string;
}

export interface Bairro {
  id: number;
  nome: string;
  descricao: string | null;
  lat: number | null;
  lng: number | null;
  zoom: number;
  agendaColeta: AgendaItem[];
}

export interface AgendaItem {
  id: number;
  bairroId: number;
  diaSemana: number;
  turno: string;
  tipoResiduo: string;
  horarioInicio: string | null;
  horarioFim: string | null;
}

export interface Veiculo {
  id: number;
  nome: string;
  tipoResiduo: string;
  placa: string | null;
  lat: number;
  lng: number;
  ultimaAtualizacao: string;
  ativo: boolean;
}

export interface Relato {
  id: number;
  nome: string | null;
  email: string | null;
  descricao: string;
  tipoProblema: string;
  fotoUrl: string | null;
  lat: number | null;
  lng: number | null;
  bairroId: number | null;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type ActiveTab = 'mapa' | 'agenda' | 'relatar' | 'motorista' | 'painel';

interface TrackingStore {
  // UI State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Data
  bairros: Bairro[];
  setBairros: (bairros: Bairro[]) => void;
  selectedBairro: Bairro | null;
  setSelectedBairro: (bairro: Bairro | null) => void;
  veiculos: Veiculo[];
  setVeiculos: (veiculos: Veiculo[]) => void;
  relatos: Relato[];
  setRelatos: (relatos: Relato[]) => void;

  // Tracking
  vehiclePositions: Map<number, VehiclePosition>;
  updateVehiclePosition: (pos: VehiclePosition) => void;
  setAllPositions: (positions: VehiclePosition[]) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Simulation
  simulationRunning: boolean;
  setSimulationRunning: (running: boolean) => void;
}

export const useTrackingStore = create<TrackingStore>((set) => ({
  // UI State
  activeTab: 'mapa',
  setActiveTab: (tab) => set({ activeTab: tab }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Data
  bairros: [],
  setBairros: (bairros) => set({ bairros }),
  selectedBairro: null,
  setSelectedBairro: (bairro) => set({ selectedBairro: bairro }),
  veiculos: [],
  setVeiculos: (veiculos) => set({ veiculos }),
  relatos: [],
  setRelatos: (relatos) => set({ relatos }),

  // Tracking
  vehiclePositions: new Map(),
  updateVehiclePosition: (pos) =>
    set((state) => {
      const newPositions = new Map(state.vehiclePositions);
      newPositions.set(pos.veiculoId, pos);
      return { vehiclePositions: newPositions };
    }),
  setAllPositions: (positions) =>
    set(() => {
      const newPositions = new Map<number, VehiclePosition>();
      positions.forEach((p) => newPositions.set(p.veiculoId, p));
      return { vehiclePositions: newPositions };
    }),
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),

  // Simulation
  simulationRunning: false,
  setSimulationRunning: (running) => set({ simulationRunning: running }),
}));

// Helper: day of week names in Portuguese
export const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

// Helper: tipo residuo labels
export const TIPO_RESIDUO_LABELS: Record<string, string> = {
  comum: 'Comum',
  reciclavel: 'Reciclável',
  organico: 'Orgânico',
};

export const TIPO_RESIDUO_COLORS: Record<string, string> = {
  comum: '#16a34a',
  reciclavel: '#2563eb',
  organico: '#d97706',
};

export const TURNO_LABELS: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
};
