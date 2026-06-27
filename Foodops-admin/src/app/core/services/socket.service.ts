import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.apiUrl.replace('/api', ''), {
      withCredentials: true,
      transports: ['websocket'],
    });
  }

  joinAdminTracking(): void {
    this.socket?.emit('adminJoinTracking');
  }

  onRiderLocationUpdate(): Observable<{ userId: string; latitude: number; longitude: number; timestamp: number }> {
    return new Observable((observer) => {
      this.socket?.on('riderLocationUpdate', (data) => observer.next(data));
      return () => this.socket?.off('riderLocationUpdate');
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
