'use client';

import { useState, useRef, type FormEvent } from 'react';
import { useTrackingStore } from '@/store/tracking-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  MapPin,
  Send,
  Upload,
} from 'lucide-react';

export default function RelatoForm() {
  const { bairros, setBairros, relatos, setRelatos } = useTrackingStore();
  const safeBairros = Array.isArray(bairros) ? bairros : [];
  const safeRelatos = Array.isArray(relatos) ? relatos : [];

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoProblema, setTipoProblema] = useState('entulho');
  const [bairroId, setBairroId] = useState<string>('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load bairros
  useState(() => {
    if (safeBairros.length === 0) {
      fetch('/api/bairros')
        .then((r) => r.json())
        .then(setBairros)
        .catch(console.error);
    }
  });

  // Load existing relatos
  useState(() => {
    if (safeRelatos.length === 0) {
      fetch('/api/relatos')
        .then((r) => r.json())
        .then(setRelatos)
        .catch(console.error);
    }
  });

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {
          setError('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        }
      );
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      setError('Por favor, descreva o problema.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      if (nome) formData.append('nome', nome);
      if (email) formData.append('email', email);
      formData.append('descricao', descricao);
      formData.append('tipoProblema', tipoProblema);
      if (bairroId) formData.append('bairroId', bairroId);
      if (userLat) formData.append('lat', userLat.toString());
      if (userLng) formData.append('lng', userLng.toString());
      if (foto) formData.append('foto', foto);

      const res = await fetch('/api/relatos', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Erro ao enviar relato');
      }

      const newRelato = await res.json();
      setRelatos([newRelato, ...safeRelatos]);
      setSuccess(true);
      setDescricao('');
      setFoto(null);
      setFotoPreview(null);

      // Reset success after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError('Erro ao enviar o relato. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          Relatar Problema
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Reporte problemas como entulho, coleta não realizada ou irregularidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Novo Relato</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Relato enviado com sucesso! A prefeitura irá analisar.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome (opcional)</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Problema</Label>
                <Select value={tipoProblema} onValueChange={setTipoProblema}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entulho">Entulho em via pública</SelectItem>
                    <SelectItem value="coleta_nao_realizada">Coleta não realizada</SelectItem>
                    <SelectItem value="ponto_irregular">Ponto de descarte irregular</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Select value={bairroId} onValueChange={setBairroId}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeBairros.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Problema *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o problema com detalhes (localização, horário, etc.)"
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Foto (opcional)</Label>
                <div className="flex items-start gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 shrink-0"
                  >
                    <Camera className="h-4 w-4" />
                    Tirar Foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = fileInputRef.current;
                      if (input) {
                        input.removeAttribute('capture');
                        input.click();
                      }
                    }}
                    className="gap-2 shrink-0"
                  >
                    <Upload className="h-4 w-4" />
                    Enviar Arquivo
                  </Button>
                </div>
                {fotoPreview && (
                  <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border">
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFoto(null);
                        setFotoPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Geolocalização</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocation}
                    className="gap-1.5"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Obter Localização
                  </Button>
                  {userLat && userLng ? (
                    <span className="text-xs text-muted-foreground">
                      {userLat.toFixed(5)}, {userLng.toFixed(5)}
                    </span>
                  ) : null}
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={submitting}>
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Enviar Relato'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent reports list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relatos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {safeRelatos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum relato registrado ainda.
                </p>
              ) : (
                safeRelatos.map((r) => (
                  <Card key={r.id} className="bg-muted/30">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">
                          {r.tipoProblema.replace(/_/g, ' ')}
                        </span>
                        <Badge
                          variant={r.status === 'resolvido' ? 'default' : r.status === 'em_analise' ? 'secondary' : 'outline'}
                          className={`text-xs shrink-0 ${
                            r.status === 'resolvido' ? 'bg-green-100 text-green-700' :
                            r.status === 'em_analise' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{r.descricao}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {r.nome && <span>{r.nome}</span>}
                        <span>{new Date(r.criadoEm).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
