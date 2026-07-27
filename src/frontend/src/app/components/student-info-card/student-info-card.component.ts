import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Aluno, PeDominante, UpdateStudentProfileRequest } from '../../models/aluno.model';

/**
 * Quadro "Aluno" da ficha (feature 022). Exibe os dados do atleta com idade
 * calculada e permite edição inline (foto, pé dominante, massa corporal, estatura).
 * Emite {@link atualizar} com os campos alterados; a página persiste via serviço.
 */
@Component({
  selector: 'app-student-info-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-info-card.component.html',
})
export class StudentInfoCardComponent {
  @Input({ required: true }) aluno!: Aluno;
  @Output() atualizar = new EventEmitter<UpdateStudentProfileRequest>();

  readonly pes: PeDominante[] = ['Direito', 'Esquerdo', 'Ambidestro'];

  editando = false;
  salvando = false;

  // Rascunho de edição
  peDominante: PeDominante | null = null;
  massaCorporal: number | null = null;
  estatura: number | null = null;
  fotoNova: string | null = null;

  iniciarEdicao(): void {
    this.peDominante = this.aluno.peDominante ?? null;
    this.massaCorporal = this.aluno.massaCorporal ?? null;
    this.estatura = this.aluno.estatura ?? null;
    this.fotoNova = null;
    this.editando = true;
  }

  cancelar(): void {
    this.editando = false;
    this.fotoNova = null;
  }

  salvar(): void {
    const dados: UpdateStudentProfileRequest = {
      peDominante: this.peDominante,
      massaCorporal: this.massaCorporal,
      estatura: this.estatura,
    };
    if (this.fotoNova) dados.foto = this.fotoNova;
    this.salvando = true;
    this.atualizar.emit(dados);
    // A página reabre o card com o aluno atualizado; encerramos o modo edição otimista.
    this.editando = false;
    this.salvando = false;
  }

  /** Lê a imagem, redimensiona para no máx. 400px e gera um data URI JPEG comprimido. */
  onFotoSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 400;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        this.fotoNova = canvas.toDataURL('image/jpeg', 0.8);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  get idade(): number | null {
    return this.calcularIdade(this.aluno.dataNascimento);
  }

  get fotoAtual(): string | null {
    return this.fotoNova ?? this.aluno.foto ?? null;
  }

  iniciais(nome: string): string {
    const parts = nome.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0][0] ?? '').toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatarData(iso: string): string {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private calcularIdade(iso: string): number | null {
    if (!iso) return null;
    const nasc = new Date(iso);
    if (Number.isNaN(nasc.getTime())) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }
}
