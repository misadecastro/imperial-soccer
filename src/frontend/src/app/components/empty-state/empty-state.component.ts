import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  @Input({ required: true }) message = '';
  /** 'block': placeholder centrado com padding (listas); 'overlay': absoluto sobre gráficos/canvas */
  @Input() variant: 'block' | 'overlay' = 'block';
}
