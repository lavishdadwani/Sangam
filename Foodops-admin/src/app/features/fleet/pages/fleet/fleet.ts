import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { FleetService } from '../../services/fleet.service';
import { FleetStats } from '../../../../core/models/admin.model';

Chart.register(...registerables);

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './fleet.html',
  styleUrls: ['./fleet.css'],
})
export class Fleet implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('ridersChart') ridersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topRidersChart') topRidersChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private ridersChart?: Chart;
  private topRidersChart?: Chart;

  stats = signal<FleetStats | null>(null);
  isLoading = signal(true);
  error = signal('');

  constructor(private fleetService: FleetService) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    // Charts are drawn after data arrives — see drawCharts()
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.fleetService.getFleetStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.isLoading.set(false);
          // Wait one tick for @if block to render canvas elements
          setTimeout(() => this.drawCharts(data), 0);
        },
        error: () => {
          this.error.set('Failed to load fleet stats.');
          this.isLoading.set(false);
        },
      });
  }

  private drawCharts(data: FleetStats): void {
    this.drawRidersChart(data);
    this.drawTopRidersChart(data);
  }

  private drawRidersChart(data: FleetStats): void {
    if (!this.ridersChartRef) return;
    this.ridersChart?.destroy();

    const { available, busy, offline } = data.riders;

    this.ridersChart = new Chart(this.ridersChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Busy', 'Offline'],
        datasets: [{
          data: [available, busy, offline],
          backgroundColor: ['#22c55e', '#f59e0b', '#9ca3af'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} riders`,
            },
          },
        },
      },
    });
  }

  private drawTopRidersChart(data: FleetStats): void {
    if (!this.topRidersChartRef || data.topRiders.length === 0) return;
    this.topRidersChart?.destroy();

    const labels = data.topRiders.map((r) =>
      r.fullName.split(' ')[0]
    );
    const counts = data.topRiders.map((r) => r.deliveryCount);

    this.topRidersChart = new Chart(this.topRidersChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Deliveries',
          data: counts,
          backgroundColor: '#6366f1',
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#f3f4f6' },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }

  formatMinutes(mins: number): string {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ridersChart?.destroy();
    this.topRidersChart?.destroy();
  }
}
