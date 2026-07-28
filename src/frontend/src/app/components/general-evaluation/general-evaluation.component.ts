import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Quadro "Avaliação Geral" da ficha (feature 022): um texto qualitativo livre
 * por aluno. Emite {@link salvarTexto}; a página persiste via serviço.
 */
@Component({
  selector: 'app-general-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-evaluation.component.html',
})
export class GeneralEvaluationComponent implements OnChanges {
  @Input() texto: string | null = null;
  @Output() salvarTexto = new EventEmitter<string>();

  rascunho = '';
  salvando = false;

  ngOnChanges(): void {
    this.rascunho = this.texto ?? '';
  }

  get alterado(): boolean {
    return this.rascunho !== (this.texto ?? '');
  }

  salvar(): void {
    this.salvando = true;
    this.salvarTexto.emit(this.rascunho);
    this.salvando = false;
  }
}
