import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  occupiedSlots: any[] = [];
  loading = true;
  
  totalSlots = 0;
  occupiedStats = 0;
  vacancyRate = '';
  revenueEst = 0;
  chartInstance: any;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.checkAdminAndLoad();
  }

  checkAdminAndLoad() {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      alert('Access Denied: Admin Privileges Required');
      this.router.navigate(['/login']);
      return;
    }
    this.fetchSlots();
  }

  fetchSlots() {
    this.loading = true;
    const token = localStorage.getItem('token');
    
    this.http.get<any[]>('http://localhost:3000/api/admin/slots', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.occupiedSlots = data;
        
        this.http.get<any>('http://localhost:3000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
          next: (stats) => {
            this.totalSlots = stats.totalSlots;
            this.occupiedStats = stats.occupiedSlots;
            this.vacancyRate = stats.vacancyRate;
            this.revenueEst = stats.revenueEst;
            
            this.loading = false;
            this.cdr.detectChanges();
            this.renderChart(this.totalSlots, this.occupiedStats);
          }
        });
      },
      error: (err) => {
        alert('Failed to load active sessions. Session may have expired.');
        this.router.navigate(['/login']);
      }
    });
  }

  unoccupySlot(location: string, slotId: string) {
    const token = localStorage.getItem('token');
    this.http.post('http://localhost:3000/api/admin/unoccupy', { location, slotId }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.fetchSlots(); // Reload grid
      },
      error: () => alert('Failed to release slot')
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  renderChart(total: number, occupied: number) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    const canvas = document.getElementById('analyticChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Occupied', 'Available'],
        datasets: [{
          data: [occupied, total - occupied],
          backgroundColor: ['#ff007f', '#00e5ff'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#fff' } }
        }
      }
    });
  }
}
