import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { Avaliacao } from '../../models/avaliacao.model';

@Component({
  selector: 'app-evolution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evolution-chart.component.html',
  styleUrl: './evolution-chart.component.css',
})
export class EvolutionChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() avaliacoes: Avaliacao[] = [];
  @Input() emptyMessage = 'Nenhuma avaliação registrada.';
  @Input() formatLabel: (data: string) => string = (data) => data;

  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private viewReady = false;

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['avaliacoes'] && this.viewReady) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const avs = [...this.avaliacoes].sort((a, b) => a.data.localeCompare(b.data));
    if (avs.length === 0) return;

    const labels = avs.map((av) => this.formatLabel(av.data));
    this.ngZone.runOutsideAngular(() => {
      this.chart = new Chart(canvas!, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Tático',
              data: avs.map((av) => av.tatico),
              borderColor: '#eab308',
              backgroundColor: 'rgba(234,179,8,0.08)',
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: false,
            },
            {
              label: 'Técnico',
              data: avs.map((av) => av.tecnico),
              borderColor: '#2a7a3d',
              backgroundColor: 'rgba(42,122,61,0.08)',
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: false,
            },
            {
              label: 'Mental',
              data: avs.map((av) => av.mental),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99,102,241,0.08)',
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 13 } } },
          },
          scales: {
            x: {
              ticks: { color: '#6b7280' },
              grid: { color: '#e5e7eb' },
            },
            y: {
              min: 2,
              max: 5,
              ticks: { stepSize: 1, color: '#6b7280' },
              grid: { color: '#e5e7eb' },
            },
          },
        },
      });
    });
  }
}
