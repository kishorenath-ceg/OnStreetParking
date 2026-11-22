import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  phone: string = '';
  role: string = '';
  walletBalance: number = 0;
  savedVehicles: any[] = [];
  bookings: any[] = [];
  
  newVehicleName: string = '';
  newVehicleNumber: string = '';
  addAmount: number = 100;
  
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadProfile();
  }

  getHeaders() {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }

  loadProfile() {
    this.http.get<any>(`http://localhost:3000/api/user/profile?t=${new Date().getTime()}`, this.getHeaders()).subscribe({
      next: async (res) => {
        this.phone = res.phone;
        this.role = res.role;
        this.walletBalance = res.walletBalance;
        this.savedVehicles = res.savedVehicles;
        
        const rawBookings = res.bookings || [];
        for(let b of rawBookings) {
          try {
            b.qrUrl = await QRCode.toDataURL(JSON.stringify({ location: b.location, slot: b.slotId, type: 'GATE_PASS' }));
          } catch(e) {}
        }
        this.bookings = rawBookings;
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  addMoney() {
    if(this.addAmount < 10) return alert('Minimum 10 INR');
    this.http.post<any>('http://localhost:3000/api/wallet/add', { amount: this.addAmount }, this.getHeaders()).subscribe({
      next: (res) => {
        this.walletBalance = res.balance;
        alert(`Successfully added ₹${this.addAmount} to your wallet!`);
      },
      error: () => alert('Failed to add money')
    });
  }

  saveVehicle() {
    if(!this.newVehicleName || !this.newVehicleNumber) return;
    this.http.post<any>('http://localhost:3000/api/user/vehicles', { name: this.newVehicleName, number: this.newVehicleNumber }, this.getHeaders()).subscribe({
      next: (res) => {
        this.savedVehicles = res.savedVehicles;
        this.newVehicleName = '';
        this.newVehicleNumber = '';
      },
      error: () => alert('Failed to save vehicle')
    });
  }

  goBack() {
    this.router.navigate(['/map']);
  }
}
