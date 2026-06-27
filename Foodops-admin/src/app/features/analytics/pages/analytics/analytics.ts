import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsData, DailyPoint } from '../../../../core/models/admin.model';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonToggleModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css'],
})
export class Analytics implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart')   revenueChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('ordersChart')    ordersChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('growthChart')    growthChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('peakChart')      peakChartRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChart')   paymentChartRef!:   ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];

  data     = signal<AnalyticsData | null>(null);
  isLoading = signal(true);
  error    = signal('');
  days     = 30;

  dayOptions = [7, 30, 90];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void { this.load(); }
  ngAfterViewInit(): void { /* charts drawn after data arrives */ }

  load(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.destroyCharts();

    this.analyticsService.getAnalytics(this.days)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => {
          this.data.set(d);
          this.isLoading.set(false);
          setTimeout(() => this.drawAll(d), 0);
        },
        error: () => {
          this.error.set('Failed to load analytics.');
          this.isLoading.set(false);
        },
      });
  }

  onDaysChange(): void { this.load(); }

  // ── Chart drawing ──────────────────────────────────────────────────────────

  private drawAll(d: AnalyticsData): void {
    const labels = this.buildDateLabels(d.days);
    this.drawRevenue(d, labels);
    this.drawOrders(d, labels);
    this.drawGrowth(d, labels);
    this.drawPeakHours(d);
    this.drawPayment(d);
  }

  private buildDateLabels(days: number): string[] {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    });
  }

  private fillDailyData(
    points: DailyPoint[],
    days: number,
    field: 'revenue' | 'orders' | 'count'
  ): number[] {
    const map = new Map<string, number>();
    points.forEach((p) => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2,'0')}-${String(p._id.day).padStart(2,'0')}`;
      map.set(key, (p as any)[field] ?? 0);
    });

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      return map.get(key) ?? 0;
    });
  }

  private drawRevenue(d: AnalyticsData, labels: string[]): void {
    if (!this.revenueChartRef) return;
    const data = this.fillDailyData(d.revenueAndOrders, d.days, 'revenue');
    this.push(new Chart(this.revenueChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (₹)',
          data,
          borderColor: '#6366f1',
          backgroundColor: '#6366f110',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: this.lineOpts('₹'),
    }));
  }

  private drawOrders(d: AnalyticsData, labels: string[]): void {
    if (!this.ordersChartRef) return;
    const data = this.fillDailyData(d.revenueAndOrders, d.days, 'orders');
    this.push(new Chart(this.ordersChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Orders',
          data,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b10',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: this.lineOpts(''),
    }));
  }

  private drawGrowth(d: AnalyticsData, labels: string[]): void {
    if (!this.growthChartRef) return;
    const data = this.fillDailyData(d.customerGrowth, d.days, 'count');
    this.push(new Chart(this.growthChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'New Customers',
          data,
          backgroundColor: '#22c55e',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f3f4f6' } },
          x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } },
        },
      },
    }));
  }

  private drawPeakHours(d: AnalyticsData): void {
    if (!this.peakChartRef) return;
    const hourMap = new Map(d.peakHours.map((h) => [h._id, h.count]));
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const data   = Array.from({ length: 24 }, (_, i) => hourMap.get(i) ?? 0);

    this.push(new Chart(this.peakChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Orders',
          data,
          backgroundColor: data.map((v) =>
            v === Math.max(...data) ? '#6366f1' : '#e0e7ff'
          ),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
          x: { ticks: { maxRotation: 0 }, grid: { display: false } },
        },
      },
    }));
  }

  private drawPayment(d: AnalyticsData): void {
    if (!this.paymentChartRef) return;
    const labels = d.paymentBreakdown.map((p) => p._id.toUpperCase());
    const data   = d.paymentBreakdown.map((p) => p.count);

    this.push(new Chart(this.paymentChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#6366f1', '#f59e0b'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    }));
  }

  private lineOpts(prefix: string): any {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f3f4f6' },
          ticks: { callback: (v: any) => `${prefix}${Number(v).toLocaleString('en-IN')}` },
        },
        x: { ticks: { maxTicksLimit: 8 }, grid: { display: false } },
      },
    };
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────
  exportRevenue(): void {
    const d = this.data();
    if (!d) return;
    const labels = this.buildDateLabels(d.days);
    const rev  = this.fillDailyData(d.revenueAndOrders, d.days, 'revenue');
    const ord  = this.fillDailyData(d.revenueAndOrders, d.days, 'orders');
    const rows = [['Date', 'Revenue (₹)', 'Orders'], ...labels.map((l, i) => [l, rev[i], ord[i]])];
    this.downloadCsv(rows, `revenue-${d.days}d.csv`);
  }

  private downloadCsv(rows: (string | number)[][], filename: string): void {
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private push(c: Chart): void { this.charts.push(c); }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  totalRevenue(): number {
    return this.data()?.revenueAndOrders.reduce((s, p) => s + (p.revenue ?? 0), 0) ?? 0;
  }

  totalOrders(): number {
    return this.data()?.revenueAndOrders.reduce((s, p) => s + (p.orders ?? 0), 0) ?? 0;
  }

  totalNewCustomers(): number {
    return this.data()?.customerGrowth.reduce((s, p) => s + (p.count ?? 0), 0) ?? 0;
  }

  peakHour(): number {
    const ph = this.data()?.peakHours ?? [];
    return ph.length ? ph.reduce((a, b) => (a.count > b.count ? a : b))._id : 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }
}
