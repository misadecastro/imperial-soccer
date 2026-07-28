import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.css',
})
export class CategorySelectorComponent {
  @Input({ required: true }) categorias: readonly string[] = [];
  @Input({ required: true }) categoriasLabels: Readonly<Record<string, string>> = {};
  @Input() selecionado: string | null = null;
  @Input() ariaLabel = 'Selecionar categoria';

  @Output() selecionadoChange = new EventEmitter<string>();

  select(cat: string): void {
    this.selecionadoChange.emit(cat);
  }
}
