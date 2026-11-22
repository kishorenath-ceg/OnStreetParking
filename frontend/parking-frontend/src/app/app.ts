import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <header style="background: rgba(10, 11, 26, 0.8); backdrop-filter: blur(16px); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 229, 255, 0.2); position: sticky; top: 0; z-index: 1000; margin: 0; box-shadow: 0 4px 30px rgba(0,0,0,0.5);">
      <div style="display: flex; align-items: center; gap: 12px; cursor: pointer" (click)="goHome()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
        <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;"><span style="color:#00e5ff;">Smart</span> Street Parking</h2>
      </div>
      <button *ngIf="isLoggedIn()" (click)="logout()" style="background: transparent; border: 1px solid #ff007f; color: #ff007f; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; transition: 0.3s;">
        Secure Sign Out
      </button>
    </header>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(private router: Router) {}
  
  isLoggedIn() { 
    return !!localStorage.getItem('token'); 
  }
  
  logout() { 
    localStorage.clear(); 
    this.router.navigate(['/login']); 
  }
  
  goHome() {
     const role = localStorage.getItem('role');
     if (role === 'admin') {
       this.router.navigate(['/admin']);
     } else if (role === 'user') {
       this.router.navigate(['/map']);
     } else {
       this.router.navigate(['/login']);
     }
  }
}