import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onLogin(username: HTMLInputElement, password: HTMLInputElement): void {
    const token = 'demo-jwt-token';
    this.authService.login(token, 'demo-refresh-token');
    this.router.navigate(['/dashboard']);
  }
}
