'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
  Globe,
  Building2,
  Landmark,
  Factory,
  ArrowRight,
  Mail,
  ChevronRight,
  CheckCircle2,
  Star,
  Menu,
  X,
  Send,
  Navigation,
  TrendingUp,
  Users,
  Recycle,
  Eye,
} from 'lucide-react';

const EMAIL = 'raposadeserto033@gmail.com';
const COMPANY = 'MarquisSolutions';

/* ─────────────────────────── helpers ─────────────────────────── */

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

function FadeIn({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}) {
  const dir = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
    none: { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...dir }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

function GlassCard({ children, className = '', hover = true }: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-lg shadow-black/5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── NAV ─────────────────────────── */

function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Como Funciona', href: '#how-it-works' },
    { label: 'Para Quem', href: '#for-whom' },
    { label: 'Contato', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-lg shadow-black/5 border-b border-emerald-100/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
            <Recycle className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-tight">LixoJá</span>
            <span className="text-[9px] text-emerald-600 font-medium leading-tight tracking-wider uppercase">by {COMPANY}</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50/50 transition-all"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${EMAIL}`}
            className="ml-3 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
          >
            Fale Conosco
          </a>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={`mailto:${EMAIL}`}
                onClick={() => setMobileOpen(false)}
                className="block mx-4 mt-3 px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold rounded-xl text-center"
              >
                Fale Conosco
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */

function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.95]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 -left-32 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 -right-32 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-3xl"
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #16a34a 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div style={{ y: y1, opacity, scale }} className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200/50 mb-6"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">Tecnologia para Gestão Pública</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Transforme a{' '}
              <GradientText>coleta de resíduos</GradientText>
              {' '}do seu município
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Plataforma inteligente de rastreamento em tempo real que conecta cidadãos, motoristas e gestores.
              Mais transparência, eficiência e qualidade no serviço de limpeza urbana.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a
                href={`mailto:${EMAIL}?subject=Interesse no LixoJá - ${COMPANY}`}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-2xl text-base shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:-translate-y-1"
              >
                <span className="relative z-10">Solicitar Demonstração</span>
                <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl text-base hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all hover:-translate-y-1"
              >
                Ver Funcionalidades
                <ChevronRight className="h-5 w-5" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {[
                  'bg-emerald-400', 'bg-teal-400', 'bg-green-500', 'bg-lime-500',
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Confiado por gestores públicos</p>
              </div>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-40" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/50">
                <Image
                  src="/landing-hero.png"
                  alt="LixoJá - Sistema de Rastreamento de Coleta"
                  width={1344}
                  height={768}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 sm:bottom-8 sm:-left-8 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Rastreamento ao Vivo</p>
                    <p className="text-xs text-gray-500">GPS em tempo real</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-4 -right-4 sm:top-8 sm:-right-8 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">+47% Eficiência</p>
                    <p className="text-xs text-gray-500">Na coleta urbana</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── FEATURES ─────────────────────────── */

const features = [
  {
    icon: <Navigation className="h-6 w-6" />,
    title: 'Rastreamento GPS em Tempo Real',
    desc: 'Acompanhe cada caminhão de coleta no mapa ao vivo. Saiba exatamente onde está e o horário previsto de chegada.',
    color: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: 'Relato de Problemas pelo Cidadão',
    desc: 'População reporta problemas com foto e geolocalização direto do celular. Sem burocracia, sem telefone.',
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Agenda de Coleta Inteligente',
    desc: 'Horários por bairro e tipo de resíduo. O cidadão sabe quando o caminhão passa e separa o lixo corretamente.',
    color: 'from-green-500 to-lime-500',
    bg: 'bg-green-50',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Painel de Gestão com KPIs',
    desc: 'Dashboard completo para prefeitura: rotas percorridas, relatos pendentes, veículos ativos e métricas de eficiência.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Painel do Motorista',
    desc: 'Interface simplificada para o operador enviar posição GPS automaticamente. Funciona com GPS real ou modo demo.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Transparência e Confiança',
    desc: 'Gestão pública transparente. Cidadãos veem o serviço acontecendo. Prefeitura comprova eficiência com dados.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-xs font-semibold text-emerald-700 mb-4">
            <Zap className="h-3.5 w-3.5" />
            FUNCIONALIDADES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
            Tudo que sua gestão precisa,{' '}
            <GradientText>em uma plataforma</GradientText>
          </h2>
          <p className="text-lg text-gray-600">
            Ferramentas completas para modernizar a coleta de resíduos e melhorar o atendimento ao cidadão.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <GlassCard className="p-6 h-full">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-5 text-gray-700`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */

const steps = [
  {
    num: '01',
    icon: <MapPin className="h-7 w-7" />,
    title: 'Instalação e Configuração',
    desc: 'Configuramos o sistema com os bairros, veículos e agenda de coleta do seu município. Em poucos dias, tudo pronto.',
  },
  {
    num: '02',
    icon: <Truck className="h-7 w-7" />,
    title: 'Motoristas Enviam Posição',
    desc: 'Os operadores acessam o painel do motorista e o GPS envia a localização automaticamente a cada 10 segundos.',
  },
  {
    num: '03',
    icon: <Eye className="h-7 w-7" />,
    title: 'Cidadãos Acompanham',
    desc: 'A população vê os caminhões no mapa, consulta a agenda e relata problemas. Tudo em tempo real pelo celular.',
  },
  {
    num: '04',
    icon: <BarChart3 className="h-7 w-7" />,
    title: 'Gestão com Dados',
    desc: 'A prefeitura tem dashboards com KPIs, rotas, status de relatos e métricas para tomada de decisão.',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-xs font-semibold text-emerald-700 mb-4">
            <Globe className="h-3.5 w-3.5" />
            COMO FUNCIONA
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
            Do zero à{' '}
            <GradientText>gestão inteligente</GradientText>
            {' '}em 4 passos
          </h2>
          <p className="text-lg text-gray-600">
            Implementação rápida e descomplicada. Sua cidade já pode estar rastreando amanhã.
          </p>
        </FadeIn>

        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-emerald-200 via-green-300 to-teal-200" />

          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.15}>
              <div className="relative text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md border border-emerald-100 flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-emerald-600">{s.num}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── DASHBOARD PREVIEW ─────────────────────────── */

function DashboardPreview() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-emerald-50/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right">
            <Image
              src="/landing-dashboard.png"
              alt="Dashboard do LixoJá"
              width={1344}
              height={768}
              className="rounded-2xl shadow-2xl border border-gray-200/50 w-full"
            />
          </FadeIn>
          <FadeIn direction="left" className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-xs font-semibold text-emerald-700">
              <BarChart3 className="h-3.5 w-3.5" />
              PAINEL DE GESTÃO
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Dados que{' '}
              <GradientText>transformam decisões</GradientText>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Dashboard completo com indicadores em tempo real para a gestão pública. Visualize rotas, monitore relatos e tome decisões baseadas em dados.
            </p>
            <div className="space-y-4 pt-2">
              {[
                'Mapa interativo com posição de todos os veículos',
                'Visualização de rotas percorridas por caminhão',
                'KPIs automáticos: relatos, pendentes, resolvidos',
                'Gestão de relatos com atualização de status',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── STATS ─────────────────────────── */

const stats = [
  { value: 47, suffix: '%', label: 'Aumento na eficiência da coleta', icon: <TrendingUp className="h-5 w-5" /> },
  { value: 100, suffix: '%', label: 'Transparência no serviço público', icon: <Eye className="h-5 w-5" /> },
  { value: 10, suffix: 's', label: 'Intervalo de atualização GPS', icon: <Navigation className="h-5 w-5" /> },
  { value: 3, suffix: 'x', label: 'Mais rápido relatar problemas', icon: <Zap className="h-5 w-5" /> },
];

function StatsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
      }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm text-white mb-4">
                {s.icon}
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-white/80 font-medium">{s.label}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FOR WHOM ─────────────────────────── */

const audiences = [
  {
    icon: <Landmark className="h-8 w-8" />,
    title: 'Prefeituras',
    desc: 'Gestão transparente da coleta de resíduos. Comprove eficiência, ouça o cidadão e otimize rotas com dados reais.',
    features: ['Dashboard com KPIs', 'Gestão de relatos', 'Rotas em tempo real', 'Relatórios automáticos'],
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    title: 'Empresas de Limpeza',
    desc: 'Monitore sua frota, comprove serviço prestado e reduza custos operacionais com roteirização inteligente.',
    features: ['Rastreamento de frota', 'Comprovação de serviço', 'Otimização de rotas', 'Relatórios para clientes'],
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    icon: <Factory className="h-8 w-8" />,
    title: 'Governos Estaduais',
    desc: 'Padronize a coleta em múltiplos municípios. Visão centralizada e comparativa de indicadores ambientais.',
    features: ['Visão multi-município', 'Indicadores padronizados', 'Benchmark entre cidades', 'Dados abertos'],
    gradient: 'from-green-500 to-lime-600',
  },
];

function ForWhomSection() {
  return (
    <section id="for-whom" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-white to-white" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-xs font-semibold text-emerald-700 mb-4">
            <Users className="h-3.5 w-3.5" />
            PARA QUEM
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
            Soluções para{' '}
            <GradientText>todos os níveis</GradientText>
            {' '}de gestão
          </h2>
          <p className="text-lg text-gray-600">
            Do município ao estado, o LixoJá se adapta à sua realidade.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8">
          {audiences.map((a, i) => (
            <FadeIn key={a.title} delay={i * 0.15}>
              <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 h-full">
                <div className={`h-2 bg-gradient-to-r ${a.gradient}`} />
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {a.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">{a.desc}</p>
                  <ul className="space-y-3">
                    {a.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── SOCIAL PROOF ─────────────────────────── */

function SocialProofSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-xs font-semibold text-emerald-700 mb-4">
            <Star className="h-3.5 w-3.5" />
            DEPOIMENTOS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
            Quem usa,{' '}
            <GradientText>recomenda</GradientText>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "Pela primeira vez, a população consegue ver os caminhões de coleta no mapa. A reclamação caiu 60% nos primeiros três meses.",
              name: 'Ana Souza',
              role: 'Secretária de Obras – Cidade Piloto',
              initials: 'AS',
            },
            {
              quote: "O painel do motorista é simples e prático. Nossos operadores adoraram. A implementação levou menos de uma semana.",
              name: 'Carlos Mendes',
              role: 'Diretor de Operações – LimpaCerta',
              initials: 'CM',
            },
            {
              quote: "Os dados do LixoJá nos permitiram reduzir o custo por km percorrido em 22%. Ferramenta indispensável para a gestão.",
              name: 'Dra. Patricia Lima',
              role: 'Consultora de Gestão Pública',
              initials: 'PL',
            },
          ].map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.15}>
              <div className="relative bg-white rounded-2xl p-8 shadow-lg shadow-black/5 border border-gray-100 h-full flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── CTA / CONTACT ─────────────────────────── */

function CTASection() {
  return (
    <section id="contact" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700" />
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 -left-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold mb-8">
            <Send className="h-3.5 w-3.5" />
            VAMOS CONVERSAR
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Pronto para modernizar
            <br />a coleta do seu município?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            Entre em contato com a equipe da {COMPANY} e descubra como o LixoJá pode transformar a gestão de resíduos da sua cidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${EMAIL}?subject=Interesse no LixoJá - Demonstração&body=Olá equipe ${COMPANY},%0D%0A%0D%0AGostaria de agendar uma demonstração do LixoJá para %5Bnome do município/empresa%5D.%0D%0A%0D%0AMuito obrigado(a)!`}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <Mail className="h-5 w-5" />
              Solicitar Demonstração Grátis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={`mailto:${EMAIL}?subject=Orçamento LixoJá - ${COMPANY}&body=Olá equipe ${COMPANY},%0D%0A%0D%0AGostaria de solicitar um orçamento para o LixoJá.%0D%0A%0D%0AInstituição: %5Bnome%5D%0D%0ACidade/Estado: %5Bcidade/UF%5D%0D%0ANúmero de veículos: %5Bquantidade%5D%0D%0A%0D%0AObrigado(a)!`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-2xl text-base border border-white/25 hover:bg-white/25 transition-all hover:-translate-y-1"
            >
              Pedir Orçamento
            </a>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${EMAIL}`} className="hover:text-white transition-colors font-medium">
                {EMAIL}
              </a>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              <span className="font-medium">{COMPANY}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */

function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">LixoJá</span>
                <p className="text-[9px] text-emerald-400 font-medium tracking-wider uppercase">by {COMPANY}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Plataforma inteligente de rastreamento e gestão de coleta de resíduos. Tecnologia a serviço da cidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#for-whom" className="hover:text-white transition-colors">Para Quem</a></li>
              <li><a href={`mailto:${EMAIL}?subject=Demo LixoJá`} className="hover:text-white transition-colors">Demonstração</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${EMAIL}`} className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {EMAIL}
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2">
                  <Recycle className="h-3.5 w-3.5" /> {COMPANY}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {COMPANY}</span></li>
              <li><span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Tecnologia & Inovação</span></li>
              <li><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> Engenharia de Software</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} {COMPANY}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            Feito com <span className="text-red-500">♥</span> para cidades mais inteligentes
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <FloatingNav />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreview />
      <StatsSection />
      <ForWhomSection />
      <SocialProofSection />
      <CTASection />
      <Footer />
    </div>
  );
}
