import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
import { StateService } from '../../services/state.service';
import { CATEGORIAS, CATEGORIAS_LABELS } from '../../models/categoria.constants';
import { Aluno } from '../../models/aluno.model';
import { Avaliacao } from '../../models/avaliacao.model';
import { Chamada, RegistroPresenca } from '../../models/chamada.model';
import { CategorySelectorComponent } from '../../components/category-selector/category-selector.component';
import { MetricCardComponent, MetricIcon } from '../../components/metric-card/metric-card.component';
import { EvolutionChartComponent } from '../../components/evolution-chart/evolution-chart.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { AuthService } from '../../services/auth.service';

interface Momento {
  id: string;
  label: string;
}

interface PrincipioItem {
  id: string;
  label: string;
}

interface PrincipioGrupo {
  titulo: string;
  filtro: 'defensivo' | 'ofensivo' | 'sempre';
  itens: PrincipioItem[];
}

interface CardInfo {
  label: string;
  value: string | number;
  icon: MetricIcon;
}

interface SessaoRecente {
  id: string;
  data: string;
  momentoLabel: string;
  fundamentosLabels: string[];
  presentes: number;
  total: number;
}

interface TopPrincipio {
  id: string;
  label: string;
  count: number;
}

interface DashboardData {
  totalTreinos: number;
  totalMinutos: number;
  presencaMedia: number;
  totalItens: number;
  volumePorMomento: Record<string, number>;
  distribuicaoFamilia: { defensivo: number; ofensivo: number; sempre: number };
  topPrincipios: TopPrincipio[];
  sessoesRecentes: SessaoRecente[];
}

interface PrincipioAbsorvido {
  id: string;
  label: string;
  count: number;
  familia: string | null;
}

interface MinutagemPonto {
  data: string;
  label: string;
  minutos: number;
}

interface HistoricoJogoItem {
  id: string;
  data: string;
  nome: string;
  minutos: number;
}

interface AlunoData {
  presencas: number;
  convocacoes: number;
  frequenciaPct: number | null;
  totalItens: number;
  volumePorMomento: Record<string, number>;
  principiosAbsorvidos: PrincipioAbsorvido[];
  jogosDisputados: number;
  minutosTotal: number;
  mediaPorJogo: number | null;
  minutagemSeries: MinutagemPonto[];
  historicoJogos: HistoricoJogoItem[];
  avaliacoesRecentes: Avaliacao[];
}

const MOMENTOS: Momento[] = [
  { id: 'org_ofensiva', label: 'Org. Ofensiva' },
  { id: 'org_defensiva', label: 'Org. Defensiva' },
  { id: 'trans_ofensiva', label: 'Trans. Ofensiva' },
  { id: 'trans_defensiva', label: 'Trans. Defensiva' },
];

const PRINCIPIOS_GRUPOS: PrincipioGrupo[] = [
  {
    titulo: 'Princípios Táticos Defensivos',
    filtro: 'defensivo',
    itens: [
      { id: 'contencao', label: 'Contenção' },
      { id: 'cobertura_defensiva', label: 'Cobertura Defensiva' },
      { id: 'unidade_defensiva', label: 'Unidade Defensiva' },
      { id: 'concentracao', label: 'Concentração' },
      { id: 'equilibrio', label: 'Equilíbrio' },
    ],
  },
  {
    titulo: 'Princípios Táticos Ofensivos',
    filtro: 'ofensivo',
    itens: [
      { id: 'espaco_sem_bola', label: 'Espaço sem Bola' },
      { id: 'espaco_com_bola', label: 'Espaço com Bola' },
      { id: 'cobertura_ofensiva', label: 'Cobertura Ofensiva' },
      { id: 'unidade_ofensiva', label: 'Unidade Ofensiva' },
      { id: 'penetracao', label: 'Penetração' },
      { id: 'mobilidade', label: 'Mobilidade' },
    ],
  },
  {
    titulo: 'Fundamentos Técnicos',
    filtro: 'sempre',
    itens: [
      { id: 'controle_chao', label: 'Controle de Bola no Chão' },
      { id: 'controle_alto', label: 'Controle de Bola no Alto' },
      { id: 'drible', label: 'Drible' },
      { id: 'passe', label: 'Passe' },
      { id: 'dominio', label: 'Domínio' },
      { id: 'finalizacao', label: 'Finalização' },
      { id: 'cabeceio', label: 'Cabeceio' },
    ],
  },
];

const DURACAO_TREINO_MIN = 60;
const TOP_PRINCIPIOS_LIMITE = 8;
const SESSOES_RECENTES_LIMITE = 6;

const FAMILIAS_LABEL: Record<string, string> = {
  defensivo: 'Princípios Táticos Defensivos',
  ofensivo: 'Princípios Táticos Ofensivos',
  sempre: 'Fundamentos Técnicos',
};

const FAMILIAS_COR: Record<string, string> = {
  defensivo: '#dc2626',
  ofensivo: '#16a34a',
  sempre: '#f59e0b',
};

const MOMENTOS_COR: Record<string, string> = {
  org_ofensiva: '#16a34a',
  org_defensiva: '#dc2626',
  trans_ofensiva: '#f59e0b',
  trans_defensiva: '#6b7280',
};

function makeRegistros(total: number, presentes: number): RegistroPresenca[] {
  const arr: RegistroPresenca[] = [];
  for (let i = 0; i < total; i++) {
    arr.push({ alunoId: `mock-${i + 1}`, status: i < presentes ? 'presente' : 'falta' });
  }
  return arr;
}

const MOCK_CHAMADAS_DASHBOARD: Omit<Chamada, 'id'>[] = [
  { categoria: 'Sub09', data: '2026-04-26', registros: makeRegistros(7, 6), momentos: ['org_ofensiva'], principiosFundamentos: ['espaco_com_bola', 'penetracao', 'finalizacao'] },
  { categoria: 'Sub09', data: '2026-04-19', registros: makeRegistros(7, 7), momentos: ['trans_defensiva'], principiosFundamentos: ['contencao', 'concentracao'] },
  { categoria: 'Sub09', data: '2026-04-14', registros: makeRegistros(7, 6), momentos: ['org_ofensiva'], principiosFundamentos: ['cobertura_ofensiva', 'unidade_ofensiva', 'passe'] },
  { categoria: 'Sub09', data: '2026-04-12', registros: makeRegistros(7, 5), momentos: ['trans_ofensiva'], principiosFundamentos: ['mobilidade', 'passe', 'drible'] },
  { categoria: 'Sub09', data: '2026-04-07', registros: makeRegistros(7, 7), momentos: ['org_defensiva'], principiosFundamentos: ['contencao', 'cobertura_defensiva', 'equilibrio'] },
  { categoria: 'Sub09', data: '2026-04-05', registros: makeRegistros(7, 6), momentos: ['org_ofensiva'], principiosFundamentos: ['espaco_com_bola', 'penetracao', 'passe', 'dominio'] },
  { categoria: 'Sub10', data: '2026-04-25', registros: makeRegistros(8, 7), momentos: ['org_ofensiva'], principiosFundamentos: ['passe', 'penetracao'] },
  { categoria: 'Sub10', data: '2026-04-18', registros: makeRegistros(8, 6), momentos: ['org_defensiva', 'trans_defensiva'], principiosFundamentos: ['contencao', 'equilibrio'] },
  { categoria: 'Sub10', data: '2026-04-11', registros: makeRegistros(8, 8), momentos: ['trans_ofensiva'], principiosFundamentos: ['mobilidade', 'espaco_com_bola', 'drible'] },
  { categoria: 'Sub10', data: '2026-04-04', registros: makeRegistros(8, 7), momentos: ['org_ofensiva'], principiosFundamentos: ['passe', 'dominio'] },
  { categoria: 'Sub10', data: '2026-03-28', registros: makeRegistros(8, 6), momentos: ['org_defensiva'], principiosFundamentos: ['cobertura_defensiva', 'contencao'] },
  { categoria: 'Sub11', data: '2026-04-24', registros: makeRegistros(9, 8), momentos: ['org_ofensiva', 'trans_ofensiva'], principiosFundamentos: ['penetracao', 'passe', 'drible'] },
  { categoria: 'Sub11', data: '2026-04-17', registros: makeRegistros(9, 7), momentos: ['org_defensiva'], principiosFundamentos: ['contencao', 'cobertura_defensiva'] },
  { categoria: 'Sub11', data: '2026-04-10', registros: makeRegistros(9, 9), momentos: ['org_ofensiva'], principiosFundamentos: ['mobilidade', 'espaco_com_bola', 'passe'] },
  { categoria: 'Sub11', data: '2026-04-03', registros: makeRegistros(9, 8), momentos: ['trans_defensiva'], principiosFundamentos: ['concentracao'] },
  { categoria: 'Sub11', data: '2026-03-27', registros: makeRegistros(9, 7), momentos: ['org_ofensiva'], principiosFundamentos: ['finalizacao', 'dominio', 'penetracao'] },
  { categoria: 'Sub12', data: '2026-04-23', registros: makeRegistros(10, 9), momentos: ['org_ofensiva'], principiosFundamentos: ['passe', 'controle_chao'] },
  { categoria: 'Sub12', data: '2026-04-16', registros: makeRegistros(10, 8), momentos: ['org_defensiva', 'trans_defensiva'], principiosFundamentos: ['contencao', 'unidade_defensiva', 'equilibrio'] },
  { categoria: 'Sub12', data: '2026-04-09', registros: makeRegistros(10, 10), momentos: ['trans_ofensiva'], principiosFundamentos: ['mobilidade', 'penetracao'] },
  { categoria: 'Sub12', data: '2026-04-02', registros: makeRegistros(10, 8), momentos: ['org_ofensiva'], principiosFundamentos: ['cobertura_ofensiva', 'passe', 'finalizacao'] },
  { categoria: 'Sub12', data: '2026-03-26', registros: makeRegistros(10, 9), momentos: ['org_defensiva'], principiosFundamentos: ['cobertura_defensiva', 'controle_alto'] },
  { categoria: 'Sub13', data: '2026-04-22', registros: makeRegistros(11, 10), momentos: ['org_ofensiva'], principiosFundamentos: ['espaco_com_bola', 'passe', 'finalizacao'] },
  { categoria: 'Sub13', data: '2026-04-15', registros: makeRegistros(11, 9), momentos: ['trans_defensiva', 'org_defensiva'], principiosFundamentos: ['contencao', 'equilibrio'] },
  { categoria: 'Sub13', data: '2026-04-08', registros: makeRegistros(11, 11), momentos: ['org_ofensiva', 'trans_ofensiva'], principiosFundamentos: ['mobilidade', 'penetracao', 'passe'] },
  { categoria: 'Sub13', data: '2026-04-01', registros: makeRegistros(11, 9), momentos: ['org_defensiva'], principiosFundamentos: ['cobertura_defensiva', 'concentracao'] },
  { categoria: 'Sub13', data: '2026-03-25', registros: makeRegistros(11, 10), momentos: ['org_ofensiva'], principiosFundamentos: ['unidade_ofensiva', 'dominio', 'cabeceio'] },
  { categoria: 'Sub14', data: '2026-04-21', registros: makeRegistros(12, 11), momentos: ['org_ofensiva'], principiosFundamentos: ['passe', 'penetracao', 'finalizacao'] },
  { categoria: 'Sub14', data: '2026-04-14', registros: makeRegistros(12, 10), momentos: ['trans_ofensiva'], principiosFundamentos: ['mobilidade', 'drible'] },
  { categoria: 'Sub14', data: '2026-04-07', registros: makeRegistros(12, 12), momentos: ['org_defensiva', 'trans_defensiva'], principiosFundamentos: ['contencao', 'unidade_defensiva', 'equilibrio', 'concentracao'] },
  { categoria: 'Sub14', data: '2026-03-31', registros: makeRegistros(12, 11), momentos: ['org_ofensiva'], principiosFundamentos: ['espaco_sem_bola', 'passe'] },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CategorySelectorComponent,
    MetricCardComponent,
    EvolutionChartComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly categorias = CATEGORIAS;
  readonly categoriasLabels = CATEGORIAS_LABELS;
  readonly momentos = MOMENTOS;

  activeTab: 'treinos' | 'alunos' = 'treinos';

  categoriaSelecionada = 'Sub09';
  categoriaAluno: string | null = null;
  termoBusca = '';
  alunoSelecionadoId: string | null = null;
  /**
   * Referência estável: recalculada apenas em selectAluno()/selectCategoriaAluno()
   * (não a cada change detection), para não destruir/recriar o gráfico de evolução
   * a cada interação não relacionada (ex.: digitar na busca de aluno).
   */
  alunoData: AlunoData | null = null;
  private alunoTabInicializada = false;

  @ViewChild('canvasVolume') private canvasVolumeRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasDistribuicao') private canvasDistribuicaoRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasVolumeAluno') private canvasVolumeAlunoRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasMinutagem') private canvasMinutagemRef?: ElementRef<HTMLCanvasElement>;

  private chartVolume: Chart | null = null;
  private chartDistribuicao: Chart | null = null;
  private chartVolumeAluno: Chart | null = null;
  private chartMinutagem: Chart | null = null;

  constructor(
    private readonly stateService: StateService,
    public readonly authService: AuthService,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.ensureMockData();
    this.refreshTreinosData();
  }

  ngAfterViewInit(): void {
    this.renderTreinosCharts();
  }

  ngOnDestroy(): void {
    [this.chartVolume, this.chartDistribuicao, this.chartVolumeAluno, this.chartMinutagem].forEach((c) => c?.destroy());
  }

  // ─── Aba Treinos ────────────────────────────────────────────────────────
  //
  // IMPORTANTE: estas propriedades são CAMPOS (não getters) para evitar que
  // computeDashboardData() seja chamada múltiplas vezes por ciclo de change
  // detection, o que causava travamento do navegador (CPU 100% em loop).
  // São atualizadas apenas por refreshTreinosData(), chamada em ngOnInit e
  // selectCategoriaTreinos().

  dashboardData: DashboardData = {
    totalTreinos: 0,
    totalMinutos: 0,
    presencaMedia: 0,
    totalItens: 0,
    volumePorMomento: {},
    distribuicaoFamilia: { defensivo: 0, ofensivo: 0, sempre: 0 },
    topPrincipios: [],
    sessoesRecentes: [],
  };
  cardsResumo: CardInfo[] = [];
  topPrincipiosMax = 0;
  volumeTreinosTotal = 0;
  distribuicaoTreinosTotal = 0;

  private refreshTreinosData(): void {
    const data = this.computeDashboardData(this.categoriaSelecionada);
    this.dashboardData = data;
    this.cardsResumo = [
      { label: 'Treinos', value: data.totalTreinos, icon: 'calendar' },
      { label: 'Minutos', value: data.totalMinutos, icon: 'clock' },
      { label: 'Presença média', value: `${data.presencaMedia}%`, icon: 'trend' },
      { label: 'Itens trabalhados', value: data.totalItens, icon: 'list' },
    ];
    const counts = data.topPrincipios.map((p) => p.count);
    this.topPrincipiosMax = counts.length ? Math.max(...counts) : 0;
    this.volumeTreinosTotal = Object.values(data.volumePorMomento).reduce((a, b) => a + b, 0);
    const d = data.distribuicaoFamilia;
    this.distribuicaoTreinosTotal = d.defensivo + d.ofensivo + d.sempre;
  }

  selectCategoriaTreinos(cat: string): void {
    if (!this.categorias.includes(cat)) return;
    this.categoriaSelecionada = cat;
    this.refreshTreinosData();
    this.renderTreinosCharts();
  }

  selectTab(tab: 'treinos' | 'alunos'): void {
    this.activeTab = tab;
    if (tab === 'alunos' && !this.alunoTabInicializada) {
      this.initAlunoTab();
    }
  }

  // ─── Aba Alunos ─────────────────────────────────────────────────────────

  get alunosFiltrados(): Aluno[] {
    if (!this.categoriaAluno) return [];
    const alunosCat = this.stateService.state.alunos.filter((a) => a.categoria === this.categoriaAluno);
    const termo = this.termoBusca.trim().toLowerCase();
    return termo ? alunosCat.filter((a) => a.nome.toLowerCase().includes(termo)) : alunosCat;
  }

  get alunoSelecionado(): Aluno | null {
    if (!this.alunoSelecionadoId) return null;
    return this.stateService.state.alunos.find((a) => a.id === this.alunoSelecionadoId) ?? null;
  }

  // Campos estáveis da aba Alunos (mesmo princípio dos campos de Treinos acima).
  cardsTreinosAluno: CardInfo[] = [];
  cardsJogosAluno: CardInfo[] = [];
  volumeAlunoTotal = 0;
  principiosAbsorvidosMax = 0;

  corFamilia(familia: string | null): string {
    return (familia && FAMILIAS_COR[familia]) || '#16a34a';
  }

  selectCategoriaAluno(cat: string): void {
    if (!this.categorias.includes(cat)) return;
    this.categoriaAluno = cat;
    this.alunoSelecionadoId = null;
    this.alunoData = null;
    this.clearAlunoCharts();
    this.refreshAlunoCards(null);
  }

  onBuscaInput(termo: string): void {
    this.termoBusca = termo;
  }

  selectAluno(alunoId: string): void {
    const aluno = this.stateService.state.alunos.find((a) => a.id === alunoId && a.categoria === this.categoriaAluno);
    if (!aluno) return;
    this.alunoSelecionadoId = aluno.id;
    this.alunoData = this.computeAlunoData(aluno);
    this.refreshAlunoCards(this.alunoData);
    this.renderAlunoCharts();
  }

  private refreshAlunoCards(data: AlunoData | null): void {
    if (!data) {
      this.cardsTreinosAluno = [];
      this.cardsJogosAluno = [];
      this.volumeAlunoTotal = 0;
      this.principiosAbsorvidosMax = 0;
      return;
    }
    const freqValor = data.frequenciaPct === null ? '—' : `${data.frequenciaPct}%`;
    this.cardsTreinosAluno = [
      { label: 'Presenças', value: `${data.presencas}/${data.convocacoes}`, icon: 'calendar' },
      { label: 'Frequência', value: freqValor, icon: 'trend' },
      { label: 'Itens trabalhados', value: data.totalItens, icon: 'list' },
    ];
    const mediaValor = data.mediaPorJogo === null ? '—' : `${data.mediaPorJogo} min`;
    this.cardsJogosAluno = [
      { label: 'Jogos disputados', value: data.jogosDisputados, icon: 'calendar' },
      { label: 'Min em Jogo', value: data.minutosTotal, icon: 'clock' },
      { label: 'Média por jogo', value: mediaValor, icon: 'trend' },
    ];
    this.volumeAlunoTotal = Object.values(data.volumePorMomento).reduce((a, b) => a + b, 0);
    const counts = data.principiosAbsorvidos.map((p) => p.count);
    this.principiosAbsorvidosMax = counts.length ? Math.max(...counts) : 0;
  }

  getIniciais(nome: string): string {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  // ─── Compute: aba Treinos ───────────────────────────────────────────────

  private computeDashboardData(categoria: string): DashboardData {
    const chamadas = this.stateService.state.chamadas.filter((c) => c.categoria === categoria);

    const totalTreinos = chamadas.length;
    const totalMinutos = totalTreinos * DURACAO_TREINO_MIN;

    const sessoesComChamada = chamadas.filter((c) => Array.isArray(c.registros) && c.registros.length > 0);
    let presencaMedia = 0;
    if (sessoesComChamada.length > 0) {
      const soma = sessoesComChamada.reduce((acc, c) => {
        const presentes = c.registros.filter((r) => r.status === 'presente').length;
        return acc + presentes / c.registros.length;
      }, 0);
      presencaMedia = Math.round((soma / sessoesComChamada.length) * 100);
    }

    const totalItens = chamadas.reduce((acc, c) => acc + (c.principiosFundamentos?.length || 0), 0);

    const volumePorMomento: Record<string, number> = {};
    MOMENTOS.forEach((m) => (volumePorMomento[m.id] = 0));
    chamadas.forEach((c) => {
      (c.momentos || []).forEach((mid) => {
        if (volumePorMomento[mid] !== undefined) volumePorMomento[mid] += 1;
      });
    });

    const distribuicaoFamilia = { defensivo: 0, ofensivo: 0, sempre: 0 };
    const contagem = new Map<string, number>();
    chamadas.forEach((c) => {
      (c.principiosFundamentos || []).forEach((id) => {
        const info = this.getPrincipioInfo(id);
        if (!info) return;
        distribuicaoFamilia[info.filtro] = (distribuicaoFamilia[info.filtro] || 0) + 1;
        contagem.set(id, (contagem.get(id) || 0) + 1);
      });
    });

    const topPrincipios = Array.from(contagem.entries())
      .map(([id, count]) => {
        const info = this.getPrincipioInfo(id);
        return { id, label: info ? info.label : id, count };
      })
      .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.label.localeCompare(b.label, 'pt-BR')))
      .slice(0, TOP_PRINCIPIOS_LIMITE);

    const sessoesRecentes: SessaoRecente[] = chamadas
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, SESSOES_RECENTES_LIMITE)
      .map((c) => {
        const ms = c.momentos || [];
        let momentoLabel = '—';
        for (const m of MOMENTOS) {
          if (ms.includes(m.id)) {
            momentoLabel = m.label;
            break;
          }
        }
        const fundamentosLabels = (c.principiosFundamentos || [])
          .map((id) => this.getPrincipioInfo(id))
          .filter((info): info is { label: string; filtro: PrincipioGrupo['filtro'] } => !!info)
          .map((info) => info.label);
        const registros = c.registros || [];
        const presentes = registros.filter((r) => r.status === 'presente').length;
        return { id: c.id, data: c.data, momentoLabel, fundamentosLabels, presentes, total: registros.length };
      });

    return {
      totalTreinos,
      totalMinutos,
      presencaMedia,
      totalItens,
      volumePorMomento,
      distribuicaoFamilia,
      topPrincipios,
      sessoesRecentes,
    };
  }

  private getPrincipioInfo(id: string): { label: string; filtro: PrincipioGrupo['filtro'] } | null {
    for (const grupo of PRINCIPIOS_GRUPOS) {
      const item = grupo.itens.find((i) => i.id === id);
      if (item) return { label: item.label, filtro: grupo.filtro };
    }
    return null;
  }

  // ─── Compute: aba Alunos ────────────────────────────────────────────────

  private computeAlunoData(aluno: Aluno): AlunoData {
    const chamadasCategoria = this.stateService.state.chamadas.filter((c) => c.categoria === aluno.categoria);
    const chamadasPresente = chamadasCategoria.filter((c) =>
      c.registros.some((r) => r.alunoId === aluno.id && r.status === 'presente'),
    );

    const presencas = chamadasPresente.length;
    const convocacoes = chamadasCategoria.length;
    const frequenciaPct = convocacoes === 0 ? null : Math.round((presencas / convocacoes) * 100);

    const totalItens = chamadasPresente.reduce((acc, c) => acc + (c.principiosFundamentos?.length || 0), 0);

    const volumePorMomento: Record<string, number> = {};
    MOMENTOS.forEach((m) => (volumePorMomento[m.id] = 0));
    chamadasPresente.forEach((c) => {
      (c.momentos || []).forEach((mid) => {
        if (volumePorMomento[mid] !== undefined) volumePorMomento[mid] += 1;
      });
    });

    const contagem = new Map<string, number>();
    chamadasPresente.forEach((c) => {
      (c.principiosFundamentos || []).forEach((id) => contagem.set(id, (contagem.get(id) || 0) + 1));
    });
    const principiosAbsorvidos: PrincipioAbsorvido[] = Array.from(contagem.entries())
      .map(([id, count]) => {
        const info = this.getPrincipioInfo(id);
        return { id, label: info ? info.label : id, count, familia: info ? info.filtro : null };
      })
      .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.label.localeCompare(b.label, 'pt-BR')));

    const jogosDoAlunoComIdx = this.stateService.state.jogos
      .map((j, idx) => ({ jogo: j, idx }))
      .filter(({ jogo }) => jogo.participacoes.some((p) => p.alunoId === aluno.id));

    const minutosFor = (j: (typeof this.stateService.state.jogos)[number]): number => {
      const p = j.participacoes.find((p) => p.alunoId === aluno.id);
      return p && typeof p.minutos === 'number' ? p.minutos : 0;
    };

    const jogosOrdAsc = jogosDoAlunoComIdx.slice().sort((a, b) => {
      const dc = a.jogo.data.localeCompare(b.jogo.data);
      return dc !== 0 ? dc : a.idx - b.idx;
    });
    const jogosOrdDesc = jogosDoAlunoComIdx.slice().sort((a, b) => {
      const dc = b.jogo.data.localeCompare(a.jogo.data);
      return dc !== 0 ? dc : a.idx - b.idx;
    });

    const jogosDisputados = jogosDoAlunoComIdx.length;
    const minutosTotal = jogosDoAlunoComIdx.reduce((acc, { jogo }) => acc + minutosFor(jogo), 0);
    const mediaPorJogo = jogosDisputados === 0 ? null : Math.round(minutosTotal / jogosDisputados);

    const minutagemSeries: MinutagemPonto[] = jogosOrdAsc.map(({ jogo }) => ({
      data: jogo.data,
      label: this.formatDDMM(jogo.data),
      minutos: minutosFor(jogo),
    }));

    const historicoJogos: HistoricoJogoItem[] = jogosOrdDesc.map(({ jogo }) => ({
      id: jogo.id,
      data: jogo.data,
      nome: jogo.nome,
      minutos: minutosFor(jogo),
    }));

    const avaliacoesRecentes = this.stateService.state.avaliacoes
      .filter((av) => av.alunoId === aluno.id)
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 6)
      .reverse();

    return {
      presencas,
      convocacoes,
      frequenciaPct,
      totalItens,
      volumePorMomento,
      principiosAbsorvidos,
      jogosDisputados,
      minutosTotal,
      mediaPorJogo,
      minutagemSeries,
      historicoJogos,
      avaliacoesRecentes,
    };
  }

  private formatDDMM(isoDate: string): string {
    if (!isoDate) return '';
    const [, month, day] = isoDate.split('-');
    return `${day}/${month}`;
  }

  // ─── Mock data (treinos) ────────────────────────────────────────────────

  private ensureMockData(): void {
    if (this.stateService.state.chamadas.length > 0) return;
    this.stateService.state.chamadas = MOCK_CHAMADAS_DASHBOARD.map((c) => ({ ...c, id: crypto.randomUUID() }));
    this.stateService.save();
  }

  // ─── Inicialização da aba Alunos (idempotente) ─────────────────────────

  private initAlunoTab(): void {
    if (this.alunoTabInicializada) return;
    const primeiraComAlunos = this.categorias.find((cat) =>
      this.stateService.state.alunos.some((a) => a.categoria === cat),
    );
    this.categoriaAluno = primeiraComAlunos || this.categorias[0];
    this.alunoTabInicializada = true;
  }

  // ─── Charts: aba Treinos ────────────────────────────────────────────────

  private renderTreinosCharts(): void {
    const data = this.dashboardData;
    this.renderVolumeChart(data);
    this.renderDistribuicaoChart(data);
  }

  private renderVolumeChart(data: DashboardData): void {
    const canvas = this.canvasVolumeRef?.nativeElement;
    if (!canvas) return;
    if (this.chartVolume) {
      this.chartVolume.destroy();
      this.chartVolume = null;
    }
    const total = Object.values(data.volumePorMomento).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    this.ngZone.runOutsideAngular(() => {
      this.chartVolume = new Chart(canvas!, {
        type: 'bar',
        data: {
          labels: MOMENTOS.map((m) => m.label),
          datasets: [
            {
              data: MOMENTOS.map((m) => data.volumePorMomento[m.id] || 0),
              backgroundColor: MOMENTOS.map((m) => MOMENTOS_COR[m.id]),
              borderRadius: 6,
              barThickness: 28,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
            x: { grid: { display: false } },
          },
        },
      });
    });
  }

  private renderDistribuicaoChart(data: DashboardData): void {
    const canvas = this.canvasDistribuicaoRef?.nativeElement;
    if (!canvas) return;
    if (this.chartDistribuicao) {
      this.chartDistribuicao.destroy();
      this.chartDistribuicao = null;
    }
    const total = data.distribuicaoFamilia.defensivo + data.distribuicaoFamilia.ofensivo + data.distribuicaoFamilia.sempre;
    if (total === 0) return;

    this.ngZone.runOutsideAngular(() => {
      this.chartDistribuicao = new Chart(canvas!, {
        type: 'doughnut',
        data: {
          labels: [FAMILIAS_LABEL['defensivo'], FAMILIAS_LABEL['ofensivo'], FAMILIAS_LABEL['sempre']],
          datasets: [
            {
              data: [data.distribuicaoFamilia.defensivo, data.distribuicaoFamilia.ofensivo, data.distribuicaoFamilia.sempre],
              backgroundColor: [FAMILIAS_COR['defensivo'], FAMILIAS_COR['ofensivo'], FAMILIAS_COR['sempre']],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
            tooltip: { enabled: true },
          },
        },
      });
    });
  }

  // ─── Charts: aba Alunos ─────────────────────────────────────────────────

  private renderAlunoCharts(): void {
    const data = this.alunoData;
    if (!data) {
      this.clearAlunoCharts();
      return;
    }
    this.renderVolumeMomentoAluno(data);
    this.renderMinutagemChart(data);
  }

  private clearAlunoCharts(): void {
    [this.chartVolumeAluno, this.chartMinutagem].forEach((c) => c?.destroy());
    this.chartVolumeAluno = null;
    this.chartMinutagem = null;
  }

  private renderVolumeMomentoAluno(data: AlunoData): void {
    const canvas = this.canvasVolumeAlunoRef?.nativeElement;
    if (!canvas) return;
    if (this.chartVolumeAluno) {
      this.chartVolumeAluno.destroy();
      this.chartVolumeAluno = null;
    }
    const total = Object.values(data.volumePorMomento).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    this.ngZone.runOutsideAngular(() => {
      this.chartVolumeAluno = new Chart(canvas!, {
        type: 'bar',
        data: {
          labels: MOMENTOS.map((m) => m.label),
          datasets: [
            {
              data: MOMENTOS.map((m) => data.volumePorMomento[m.id] || 0),
              backgroundColor: MOMENTOS.map((m) => MOMENTOS_COR[m.id]),
              borderRadius: 6,
              barThickness: 28,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
            x: { grid: { display: false } },
          },
        },
      });
    });
  }

  private renderMinutagemChart(data: AlunoData): void {
    const canvas = this.canvasMinutagemRef?.nativeElement;
    if (!canvas) return;
    if (this.chartMinutagem) {
      this.chartMinutagem.destroy();
      this.chartMinutagem = null;
    }
    if (data.minutagemSeries.length === 0) return;

    this.ngZone.runOutsideAngular(() => {
      this.chartMinutagem = new Chart(canvas!, {
        type: 'line',
        data: {
          labels: data.minutagemSeries.map((s) => s.label),
          datasets: [
            {
              data: data.minutagemSeries.map((s) => s.minutos),
              borderColor: '#16a34a',
              backgroundColor: 'rgba(22,163,74,0.15)',
              fill: true,
              tension: 0.25,
              pointRadius: 4,
              pointBackgroundColor: '#16a34a',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => items[0].label,
                label: (item) => `${item.parsed.y} min`,
              },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 5, precision: 0 } },
            x: { grid: { display: false } },
          },
        },
      });
    });
  }

}
