import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, signal, NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { Subject, takeUntil } from 'rxjs';
import { RidersService } from '../../../riders/services/riders.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Rider } from '../../../../core/models/admin.model';

interface RiderMarker {
  rider: Rider;
  marker: L.Marker;
  lastSeen: number;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './tracking.html',
  styleUrls: ['./tracking.css'],
})
export class Tracking implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  private map!: L.Map;
  private riderMarkers = new Map<string, RiderMarker>();

  riders = signal<Rider[]>([]);
  isLoading = signal(true);
  onlineCount = signal(0);
  error = signal('');

  constructor(
    private ridersService: RidersService,
    private socketService: SocketService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadRiders();
    this.socketService.connect();
    this.socketService.joinAdminTracking();

    // Listen for live location updates outside Angular zone for perf
    this.socketService.onRiderLocationUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.ngZone.run(() => this.handleLocationUpdate(data));
      });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20.5937, 78.9629], // India
      zoom: 5,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  private loadRiders(): void {
    this.ridersService.getRiders({ limit: 200, page: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.riders.set(data.riders);
          this.onlineCount.set(data.riders.filter((r) => r.isOnline).length);
          this.isLoading.set(false);
          // Place markers once map is ready
          setTimeout(() => this.placeMarkers(data.riders), 100);
        },
        error: () => {
          this.error.set('Failed to load riders.');
          this.isLoading.set(false);
        },
      });
  }

  private placeMarkers(riders: Rider[]): void {
    riders.forEach((rider) => {
      const [lng, lat] = rider.location?.coordinates ?? [0, 0];
      if (!lat && !lng) return;

      const marker = L.marker([lat, lng], {
        icon: this.buildIcon(rider.isOnline, rider.status),
      })
        .addTo(this.map)
        .bindPopup(this.buildPopup(rider));

      this.riderMarkers.set(rider._id, { rider, marker, lastSeen: Date.now() });
    });
  }

  private handleLocationUpdate(data: { userId: string; latitude: number; longitude: number; timestamp: number }): void {
    const existing = this.riderMarkers.get(data.userId);
    if (existing) {
      existing.marker.setLatLng([data.latitude, data.longitude]);
      existing.lastSeen = data.timestamp;

      // Refresh popup content
      const updated = { ...existing.rider, isOnline: true };
      existing.marker.setPopupContent(this.buildPopup(updated as Rider));
      existing.marker.setIcon(this.buildIcon(true, existing.rider.status));
    }

    // Update online count
    this.onlineCount.update((c) => {
      const alreadyCounted = this.riderMarkers.get(data.userId)?.rider.isOnline;
      return alreadyCounted ? c : c + 1;
    });

    // Update rider in signal
    this.riders.update((list) =>
      list.map((r) =>
        r._id === data.userId
          ? { ...r, isOnline: true, location: { ...r.location, coordinates: [data.longitude, data.latitude] } }
          : r
      )
    );
  }

  private buildIcon(isOnline: boolean, status: string): L.DivIcon {
    const color = isOnline ? '#22c55e' : '#9ca3af';
    const border = status === 'blocked' || status === 'banned' ? '#dc2626' : color;

    return L.divIcon({
      className: '',
      html: `<div style="
        width:16px;height:16px;border-radius:50%;
        background:${color};border:3px solid ${border};
        box-shadow:0 0 0 3px ${color}33;
        transition:all 0.3s;
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12],
    });
  }

  private buildPopup(rider: Rider): string {
    const statusColor = rider.isOnline ? '#22c55e' : '#9ca3af';
    return `
      <div style="min-width:160px;font-family:sans-serif">
        <strong style="font-size:0.95rem">${rider.fullName}</strong><br/>
        <span style="font-size:0.78rem;color:#6b7280">${rider.email}</span><br/>
        <span style="color:${statusColor};font-size:0.78rem;font-weight:600">
          ${rider.isOnline ? '● Online' : '○ Offline'}
        </span>
        <span style="font-size:0.78rem;color:#6b7280;margin-left:8px">${rider.status}</span><br/>
        ${rider.location?.city ? `<span style="font-size:0.78rem;color:#374151">📍 ${rider.location.city}</span>` : ''}
      </div>`;
  }

  refreshRiders(): void {
    this.riderMarkers.forEach(({ marker }) => marker.remove());
    this.riderMarkers.clear();
    this.isLoading.set(true);
    this.loadRiders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
    this.map?.remove();
  }
}
