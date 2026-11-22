import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  mode: 'login' | 'register' | 'forgot' | 'reset' = 'login';
  form = { phone: '', password: '', role: 'user' };
  forgotOtp: string = '';
  rememberMe: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const savedPhone = localStorage.getItem('savedPhone');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedPhone && savedPassword) {
      this.form.phone = savedPhone;
      this.form.password = savedPassword;
      this.rememberMe = true;
    }
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  setMode(m: 'login' | 'register' | 'forgot' | 'reset') {
    this.mode = m;
  }

  forgotPassword() {
    if (!this.form.phone) return alert('Enter your mobile number first');
    this.http.post('http://localhost:3000/api/auth/forgot-otp', { phone: this.form.phone }).subscribe({
      next: () => this.mode = 'reset',
      error: (err: any) => alert(err.error?.error || 'Failed to request OTP')
    });
  }

  resetPassword() {
    this.http.post('http://localhost:3000/api/auth/reset-password', { phone: this.form.phone, otp: this.forgotOtp, newPassword: this.form.password }).subscribe({
      next: () => {
        alert('Password reset successfully! Please login with your new credentials.');
        this.mode = 'login';
        this.form.password = '';
        this.forgotOtp = '';
      },
      error: (err: any) => alert(err.error?.error || 'Invalid OTP')
    });
  }

  submit() {
    const endpoint = this.mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    this.http.post(`http://localhost:3000${endpoint}`, this.form).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        if (this.rememberMe && this.mode === 'login') {
          localStorage.setItem('savedPhone', this.form.phone);
          localStorage.setItem('savedPassword', this.form.password);
        } else if (!this.rememberMe) {
          localStorage.removeItem('savedPhone');
          localStorage.removeItem('savedPassword');
        }
        
        if (res.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/map']);
        }
      },
      error: (err: any) => {
        if (err.status === 0) {
          alert('Server Offline: Please start the backend running on port 3000.');
        } else {
          alert(err.error?.error || 'Authentication Failed');
        }
      }
    });
  }
}
