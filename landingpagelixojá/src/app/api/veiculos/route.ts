import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const veiculos = await db.veiculo.findMany({
      where: { ativo: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(veiculos);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
