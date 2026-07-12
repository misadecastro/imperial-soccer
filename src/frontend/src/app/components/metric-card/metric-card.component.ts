import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MetricIcon = 'calendar' | 'clock' | 'trend' | 'list';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
})
export class MetricCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value: string | number = '';
  @Input({ required: true }) icon!: MetricIcon;
}
