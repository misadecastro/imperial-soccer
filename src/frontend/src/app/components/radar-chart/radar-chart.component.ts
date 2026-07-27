import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

/**
 * Gráfico de radar reutilizável (feature 022). Um eixo por rótulo, escala 0–5.
 * Com menos de 3 itens o radar não faz sentido — exibe um fallback em lista.
 */
@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radar-chart.component.html',
})
export class RadarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() valores: number[] = [];

  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private viewReady = false;

  get usarRadar(): boolean {
    return this.labels.length >= 3;
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(): void {
    if (this.viewReady) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.usarRadar || !this.canvasRef) {
      this.chart?.destroy();
      this.chart = undefined;
      return;
    }
    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'radar',
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.valores,
            backgroundColor: 'rgba(37, 99, 235, 0.35)',
            borderColor: 'rgba(37, 99, 235, 0.9)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: { stepSize: 1, showLabelBackdrop: false },
            pointLabels: { font: { size: 10 } },
          },
        },
      },
    });
  }
}
