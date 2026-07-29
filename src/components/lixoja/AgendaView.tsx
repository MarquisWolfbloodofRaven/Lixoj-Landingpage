'use client';

import { useEffect, useState } from 'react';
import {
  useTrackingStore,
  DIAS_SEMANA,
  TIPO_RESIDUO_LABELS,
  TIPO_RESIDUO_COLORS,
  TURNO_LABELS,
  type Bairro,
  type AgendaItem,
} from '@/store/tracking-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays, Clock, MapPin, Trash2, Recycle, Leaf } from 'lucide-react';

export default function AgendaView() {
  const { bairros, setBairros, selectedBairro, setSelectedBairro } = useTrackingStore();
  const [todayAgenda, setTodayAgenda] = useState<AgendaItem[]>([]);
  const [weekAgenda, setWeekAgenda] = useState<AgendaItem[]>([]);

  const currentDayOfWeek = new Date().getDay();

  const safeBairros = Array.isArray(bairros) ? bairros : [];
  const safeTodayAgenda = Array.isArray(todayAgenda) ? todayAgenda : [];
  const safeWeekAgenda = Array.isArray(weekAgenda) ? weekAgenda : [];

  useEffect(() => {
    if (safeBairros.length === 0) {
      fetch('/api/bairros')
        .then((r) => r.json())
        .then((data: Bairro[]) => {
          setBairros(data);
        })
        .catch(console.error);
    }
  }, [bairros.length, setBairros]);

  useEffect(() => {
    if (selectedBairro) {
      fetch(`/api/agenda?bairroId=${selectedBairro.id}`)
        .then((r) => r.json())
        .then((data: AgendaItem[]) => {
          setTodayAgenda(data.filter((a) => a.diaSemana === currentDayOfWeek));
          setWeekAgenda(data);
        })
        .catch(console.error);
    } else {
      // Show today's collection across all neighborhoods
      fetch(`/api/agenda?diaSemana=${currentDayOfWeek}`)
        .then((r) => r.json())
        .then((data: AgendaItem[]) => {
          setTodayAgenda(data);
        })
        .catch(console.error);
      fetch('/api/agenda')
        .then((r) => r.json())
        .then((data: AgendaItem[]) => {
          setWeekAgenda(data);
        })
        .catch(console.error);
    }
  }, [selectedBairro, currentDayOfWeek]);

  const getResiduoIcon = (tipo: string) => {
    switch (tipo) {
      case 'reciclavel':
        return <Recycle className="h-4 w-4" style={{ color: TIPO_RESIDUO_COLORS.reciclavel }} />;
      case 'organico':
        return <Leaf className="h-4 w-4" style={{ color: TIPO_RESIDUO_COLORS.organico }} />;
      default:
        return <Trash2 className="h-4 w-4" style={{ color: TIPO_RESIDUO_COLORS.comum }} />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Agenda de Coleta
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Consulte os dias e horários de coleta por bairro
          </p>
        </div>
        <Select
          value={selectedBairro?.id.toString() || 'all'}
          onValueChange={(val) => {
            if (val === 'all') {
              setSelectedBairro(null);
            } else {
              const b = safeBairros.find((b) => b.id.toString() === val);
              setSelectedBairro(b || null);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <MapPin className="h-4 w-4 mr-1.5" />
            <SelectValue placeholder="Todos os bairros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bairros</SelectItem>
            {safeBairros.map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Today's schedule - highlighted */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Coleta de Hoje
            <Badge variant="default" className="ml-1">
              {DIAS_SEMANA[currentDayOfWeek]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeTodayAgenda.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma coleta programada para hoje no bairro selecionado.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {safeTodayAgenda.map((item) => (
                <Card key={item.id} className="bg-background">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-1.5">
                        {getResiduoIcon(item.tipoResiduo)}
                        {TIPO_RESIDUO_LABELS[item.tipoResiduo]}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: TIPO_RESIDUO_COLORS[item.tipoResiduo],
                          color: TIPO_RESIDUO_COLORS[item.tipoResiduo],
                        }}
                      >
                        {TURNO_LABELS[item.turno] || item.turno}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.bairro?.nome || `Bairro ${item.bairroId}`}
                    </p>
                    {(item.horarioInicio || item.horarioFim) && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.horarioInicio} - {item.horarioFim}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full week schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Agenda Semanal Completa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5, 6].map((dia) => {
              const dayItems = safeWeekAgenda.filter((a) => a.diaSemana === dia);
              const isToday = dia === currentDayOfWeek;
              return (
                <div key={dia}>
                  <div className={`flex items-center gap-2 mb-2 ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    <span className="text-sm">{DIAS_SEMANA[dia]}</span>
                    {isToday && <Badge variant="secondary" className="text-xs">Hoje</Badge>}
                  </div>
                  {dayItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground ml-4 mb-2">Sem coleta programada</p>
                  ) : (
                    <div className="ml-4 flex flex-wrap gap-2 mb-2">
                      {dayItems.map((item) => (
                        <Badge
                          key={item.id}
                          variant="outline"
                          className="text-xs py-1 px-2.5"
                          style={{
                            borderColor: TIPO_RESIDUO_COLORS[item.tipoResiduo] + '60',
                            color: TIPO_RESIDUO_COLORS[item.tipoResiduo],
                          }}
                        >
                          {item.bairro?.nome || `Bairro ${item.bairroId}`} — {TIPO_RESIDUO_LABELS[item.tipoResiduo]} ({TURNO_LABELS[item.turno]})
                          {(item.horarioInicio || item.horarioFim) && ` ${item.horarioInicio}-${item.horarioFim}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
