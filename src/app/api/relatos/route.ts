import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const relatos = await db.relato.findMany({
      orderBy: { criadoEm: 'desc' },
      take: 50,
    });
    return NextResponse.json(relatos);
  } catch (error) {
    console.error('Erro ao buscar relatos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const nome = formData.get('nome') as string | null;
    const email = formData.get('email') as string | null;
    const descricao = formData.get('descricao') as string;
    const tipoProblema = formData.get('tipoProblema') as string || 'entulho';
    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : null;
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : null;
    const bairroId = formData.get('bairroId') ? parseInt(formData.get('bairroId') as string) : null;
    const foto = formData.get('foto') as File | null;

    if (!descricao) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });
    }

    let fotoUrl: string | null = null;
    if (foto && foto.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'relatos');
      await mkdir(uploadsDir, { recursive: true });
      const fileName = `${Date.now()}-${foto.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, fileName);
      const bytes = await foto.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
      fotoUrl = `/uploads/relatos/${fileName}`;
    }

    const relato = await db.relato.create({
      data: {
        nome: nome || null,
        email: email || null,
        descricao,
        tipoProblema,
        fotoUrl,
        lat,
        lng,
        bairroId,
        status: 'pendente',
      },
    });

    return NextResponse.json(relato, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar relato:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
