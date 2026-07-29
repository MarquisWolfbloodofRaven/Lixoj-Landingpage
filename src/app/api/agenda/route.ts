import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bairroId = searchParams.get('bairroId');
    const diaSemana = searchParams.get('diaSemana');

    const where: Record<string, unknown> = {};
    if (bairroId) where.bairroId = parseInt(bairroId);
    if (diaSemana !== null) where.diaSemana = parseInt(diaSemana);

    const agenda = await db.agendaColeta.findMany({
      where,
      include: { bairro: true },
      orderBy: [{ diaSemana: 'asc' }, { turno: 'asc' }],
    });

    return NextResponse.json(agenda);
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
