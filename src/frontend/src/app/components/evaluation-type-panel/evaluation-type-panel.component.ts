import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationType } from '../../models/evaluation-type.model';
import { Evaluation } from '../../models/evaluation.model';
import { RadarChartComponent } from '../radar-chart/radar-chart.component';

/**
 * Quadro de um tipo de avaliação na ficha (feature 022). Sem avaliação: botão
 * "Avaliar" (prancheta) central. Com avaliação: radar (avaliação mais recente) e
 * o "Avaliar" no canto superior direito (só ícone + tooltip).
 */
@Component({
  selector: 'app-evaluation-type-panel',
  standalone: true,
  imports: [CommonModule, RadarChartComponent],
  templateUrl: './evaluation-type-panel.component.html',
})
export class EvaluationTypePanelComponent {
  @Input({ required: true }) tipo!: EvaluationType;
  @Input() avaliacoes: Evaluation[] = [];
  @Output() avaliar = new EventEmitter<EvaluationType>();

  get temAvaliacao(): boolean {
    return this.avaliacoes.length > 0;
  }

  private get ultima(): Evaluation | null {
    if (this.avaliacoes.length === 0) return null;
    return [...this.avaliacoes].sort((a, b) => b.data.localeCompare(a.data))[0];
  }

  get labels(): string[] {
    return this.tipo.itens.map((i) => i.nome);
  }

  get valores(): number[] {
    const ult = this.ultima;
    return this.tipo.itens.map((i) => ult?.pontuacoes.find((p) => p.itemId === i.id)?.nota ?? 0);
  }

  onAvaliar(): void {
    this.avaliar.emit(this.tipo);
  }
}
