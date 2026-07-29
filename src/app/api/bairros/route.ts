import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const bairros = await db.bairro.findMany({
      orderBy: { nome: 'asc' },
      include: {
        agendaColeta: {
          orderBy: [{ diaSemana: 'asc' }, { turno: 'asc' }],
        },
      },
    });
    return NextResponse.json(bairros);
  } catch (error) {
    console.error('Erro ao buscar bairros:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
