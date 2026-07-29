import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  // Limpar dados existentes
  await prisma.posicaoVeiculo.deleteMany();
  await prisma.relato.deleteMany();
  await prisma.agendaColeta.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.bairro.deleteMany();

  // Bairros de Uruguaiana/RS com coordenadas reais
  const bairros = await Promise.all([
    prisma.bairro.create({
      data: {
        nome: 'Centro',
        descricao: 'Centro histórico e comercial de Uruguaiana',
        lat: -29.7547,
        lng: -57.0829,
        zoom: 16,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'São João',
        descricao: 'Bairro residencial São João',
        lat: -29.7480,
        lng: -57.0780,
        zoom: 15,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'Esperança',
        descricao: 'Bairro Esperança',
        lat: -29.7610,
        lng: -57.0750,
        zoom: 15,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'Vila Nova',
        descricao: 'Vila Nova',
        lat: -29.7520,
        lng: -57.0920,
        zoom: 15,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'Barcelona',
        descricao: 'Bairro Barcelona',
        lat: -29.7590,
        lng: -57.0900,
        zoom: 15,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'Passo dos Webers',
        descricao: 'Passo dos Webers',
        lat: -29.7450,
        lng: -57.0860,
        zoom: 15,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'Palma',
        descricao: 'Bairro Palma',
        lat: -29.7680,
        lng: -57.0850,
        zoom: 15,
      },
    }),
    prisma.bairro.create({
      data: {
        nome: 'Ipanema',
        descricao: 'Bairro Ipanema',
        lat: -29.7500,
        lng: -57.0690,
        zoom: 15,
      },
    }),
  ]);

  // Veículos
  const veiculos = await Promise.all([
    prisma.veiculo.create({
      data: {
        nome: 'Caminhão Comum 01',
        tipoResiduo: 'comum',
        placa: 'ISV-1234',
        lat: -29.7547,
        lng: -57.0829,
        ativo: true,
      },
    }),
    prisma.veiculo.create({
      data: {
        nome: 'Caminhão Reciclável 01',
        tipoResiduo: 'reciclavel',
        placa: 'ISV-5678',
        lat: -29.7480,
        lng: -57.0780,
        ativo: true,
      },
    }),
    prisma.veiculo.create({
      data: {
        nome: 'Caminhão Orgânico 01',
        tipoResiduo: 'organico',
        placa: 'ISV-9012',
        lat: -29.7610,
        lng: -57.0750,
        ativo: false,
      },
    }),
  ]);

  // Agenda de coleta semanal
  const agendaData = [
    // Centro
    { bairroId: bairros[0].id, diaSemana: 1, turno: 'manha', tipoResiduo: 'comum', horarioInicio: '07:00', horarioFim: '09:00' },
    { bairroId: bairros[0].id, diaSemana: 1, turno: 'tarde', tipoResiduo: 'reciclavel', horarioInicio: '14:00', horarioFim: '16:00' },
    { bairroId: bairros[0].id, diaSemana: 3, turno: 'manha', tipoResiduo: 'comum', horarioInicio: '07:00', horarioFim: '09:00' },
    { bairroId: bairros[0].id, diaSemana: 5, turno: 'manha', tipoResiduo: 'comum', horarioInicio: '07:00', horarioFim: '09:00' },
    { bairroId: bairros[0].id, diaSemana: 5, turno: 'tarde', tipoResiduo: 'reciclavel', horarioInicio: '14:00', horarioFim: '16:00' },
    // São João
    { bairroId: bairros[1].id, diaSemana: 2, turno: 'manha', tipoResiduo: 'comum', horarioInicio: '07:00', horarioFim: '09:30' },
    { bairroId: bairros[1].id, diaSemana: 4, turno: 'tarde', tipoResiduo: 'reciclavel', horarioInicio: '14:00', horarioFim: '16:30' },
    // Esperança
    { bairroId: bairros[2].id, diaSemana: 2, turno: 'tarde', tipoResiduo: 'comum', horarioInicio: '13:00', horarioFim: '15:00' },
    { bairroId: bairros[2].id, diaSemana: 4, turno: 'manha', tipoResiduo: 'reciclavel', horarioInicio: '08:00', horarioFim: '10:00' },
    // Vila Nova
    { bairroId: bairros[3].id, diaSemana: 3, turno: 'tarde', tipoResiduo: 'comum', horarioInicio: '13:00', horarioFim: '15:00' },
    { bairroId: bairros[3].id, diaSemana: 5, turno: 'manha', tipoResiduo: 'reciclavel', horarioInicio: '07:30', horarioFim: '09:30' },
    // Barcelona
    { bairroId: bairros[4].id, diaSemana: 1, turno: 'tarde', tipoResiduo: 'comum', horarioInicio: '14:00', horarioFim: '16:00' },
    { bairroId: bairros[4].id, diaSemana: 3, turno: 'manha', tipoResiduo: 'reciclavel', horarioInicio: '07:00', horarioFim: '09:00' },
    // Passo dos Webers
    { bairroId: bairros[5].id, diaSemana: 4, turno: 'tarde', tipoResiduo: 'comum', horarioInicio: '13:30', horarioFim: '15:30' },
    // Palma
    { bairroId: bairros[6].id, diaSemana: 6, turno: 'manha', tipoResiduo: 'comum', horarioInicio: '08:00', horarioFim: '10:00' },
    // Ipanema
    { bairroId: bairros[7].id, diaSemana: 6, turno: 'tarde', tipoResiduo: 'reciclavel', horarioInicio: '14:00', horarioFim: '16:00' },
  ];

  for (const agenda of agendaData) {
    await prisma.agendaColeta.create({ data: agenda });
  }

  console.log('Database seeded successfully!');
  console.log(`- ${bairros.length} bairros criados`);
  console.log(`- ${veiculos.length} veículos criados`);
  console.log(`- ${agendaData.length} registros de agenda criados`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
