import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Route to start/stop vehicle simulation via API
// The actual simulation is done by the tracking-service WebSocket

export async function GET() {
  try {
    const veiculos = await db.veiculo.findMany({
      where: { ativo: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(veiculos);
  } catch (error) {
    console.error('Erro ao buscar veículos para simulação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veiculoId, lat, lng } = body;

    if (veiculoId === undefined || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Update vehicle position in database
    const veiculo = await db.veiculo.update({
      where: { id: veiculoId },
      data: {
        lat,
        lng,
        ultimaAtualizacao: new Date(),
      },
    });

    return NextResponse.json(veiculo);
  } catch (error) {
    console.error('Erro ao atualizar posição:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
