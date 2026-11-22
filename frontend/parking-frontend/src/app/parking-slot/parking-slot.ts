import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';

interface Slot {
  id: string;
  available: boolean;
  floor?: string;
}

@Component({
  selector: 'app-parking-slot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-slot.html',
  styleUrls: ['./parking-slot.css']
})
export class ParkingSlot implements OnInit {
  parkingName: string = '';
  slots: Slot[] = [];
  loading: boolean = true;
  
  highDemand: boolean = false;
  isFull: boolean = false;
  waitlistPhone: string = '';
  selectedSlot: Slot | null = null;
  step: number = 1;
  otpInput: string = '';
  paymentMethod: string = '';
  paymentDetails = { cardNumber: '', cardExpiry: '', cardCvv: '', upiId: '' };
  reservationForm = { name: '', vehicle: '', phone: '', duration: '1' };

  walletBalance: number = 0;
  savedVehicles: any[] = [];
  qrCodeUrl: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.parkingName = params['name'];
        this.loadSlotsFor(this.parkingName);
        console.log('ParkingSlot loaded for', this.parkingName);
        try { document.body.classList.remove('fade-out'); } catch (e) {}
        setTimeout(() => {
          const el = document.querySelector('.slot-page');
          if (el) el.classList.add('fade-in');
        }, 20);
      }
    });
    this.loadProfile();
  }

  loadProfile() {
    this.http.get<any>(`http://localhost:3000/api/user/profile?t=${new Date().getTime()}`, this.getHeaders()).subscribe({
      next: (res) => {
        this.walletBalance = res.walletBalance || 0;
        this.savedVehicles = res.savedVehicles || [];
        if (res.phone) this.reservationForm.phone = res.phone;
      },
      error: () => console.log('Guest user, no wallet')
    });
  }

  loadSlotsFor(name: string) {
    this.loading = true;
    this.http.get<any>(`http://localhost:3000/api/parking/${encodeURIComponent(name)}`)
      .subscribe({
        next: (data) => {
          this.slots = data.slots || data;
          this.highDemand = data.highDemand || false;
          this.isFull = this.slots.length > 0 && this.slots.every((s: Slot) => !s.available);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load slots:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  isFormValid() {
    return this.reservationForm.name.trim() !== '' && 
           this.reservationForm.vehicle.trim() !== '' && 
           this.reservationForm.phone.trim().length >= 10;
  }

  getPrice() {
    const d = parseInt(this.reservationForm.duration);
    let base = 60;
    if (d === 2) base = 120;
    if (d === 4) base = 200;
    return this.highDemand ? base * 1.5 : base;
  }

  openReserveModal(slot: Slot) {
    if (!slot.available) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication Required! Please Sign In or Register to book dynamic parking.');
      this.router.navigate(['/login']);
      return;
    }

    this.selectedSlot = slot;
    this.step = 1;
    this.otpInput = '';
    this.paymentMethod = '';
    this.paymentDetails = { cardNumber: '', cardExpiry: '', cardCvv: '', upiId: '' };
  }

  closeModal() {
    this.selectedSlot = null;
    this.reservationForm = { name: '', vehicle: '', phone: '', duration: '1' };
  }

  getHeaders() {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  }

  requestOTP() {
    this.http.post('http://localhost:3000/api/send-otp', { phone: this.reservationForm.phone }, this.getHeaders())
      .subscribe({
        next: (res: any) => { 
          this.step = 2; 
          this.cdr.detectChanges(); 
        },
        error: () => alert('Failed to route physical SMS. Check Twilio Credits/Limits.')
      });
  }

  verifyOTP() {
    this.http.post('http://localhost:3000/api/verify-otp', { phone: this.reservationForm.phone, otp: this.otpInput }, this.getHeaders())
      .subscribe({
        next: (res: any) => { 
          if (res.valid) {
            this.step = 3; 
          } else {
            alert('Invalid OTP'); 
          }
          this.cdr.detectChanges(); 
        },
        error: () => alert('Invalid OTP Network Error')
      });
  }

  isPaymentValid() {
    if (!this.paymentMethod) return false;
    if (this.paymentMethod === 'WALLET') {
      return this.walletBalance >= this.getPrice();
    }
    if (this.paymentMethod === 'CARD') {
      return this.paymentDetails.cardNumber.trim().length === 16 &&
             this.paymentDetails.cardExpiry.trim().length === 5 &&
             this.paymentDetails.cardCvv.trim().length === 3;
    } else if (this.paymentMethod === 'UPI') {
      return this.paymentDetails.upiId.trim().length > 3 && this.paymentDetails.upiId.includes('@');
    }
    return false;
  }

  processPayment() {
    if (this.paymentMethod === 'WALLET') {
      this.http.post('http://localhost:3000/api/wallet/deduct', { amount: this.getPrice() }, this.getHeaders())
        .subscribe({
          next: () => this.confirmReservation(),
          error: () => alert('Wallet Deduction Failed! Insufficient Funds?')
        });
      return;
    }
    this.http.post('http://localhost:3000/api/payment', { amount: this.getPrice(), method: this.paymentMethod }, this.getHeaders())
      .subscribe({
        next: () => this.confirmReservation(), 
        error: () => alert('Payment Failed')
      });
  }

  confirmReservation() {
    if (!this.selectedSlot || !this.selectedSlot.available) return;
    
    const slot = this.selectedSlot;
    const oldId = slot.id;
    
    // Optimistic UI update
    slot.available = false;
    slot.id = "WAIT...";
    const reqForm = { ...this.reservationForm }; 
    this.closeModal();
    this.cdr.detectChanges();
    
    this.http.post('http://localhost:3000/api/reserve', {
      location: this.parkingName,
      slotId: oldId,
      details: reqForm
    }, this.getHeaders()).subscribe({
      next: async (res: any) => {
        slot.id = "RESERVED";
        try {
          this.qrCodeUrl = await QRCode.toDataURL(JSON.stringify({ location: this.parkingName, slot: oldId, type: 'GATE_PASS' }));
        } catch(e) { console.error('QR Gen Failed', e); }
        this.cdr.detectChanges();
        
        setTimeout(() => {
          slot.id = oldId;
          this.selectedSlot = slot;
          this.step = 4; // Move to pass screen
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        console.error('Reservation failed', err);
        slot.available = true; // roll back
        slot.id = oldId;
        this.cdr.detectChanges();
        alert('Failed to reserve slot! It might have been taken just now.');
      }
    });
  }

  backToMap() {
    this.router.navigate(['']);
  }

  joinWaitlist() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication Required! Please Sign In to join waitlist.');
      this.router.navigate(['/login']);
      return;
    }
    if (this.waitlistPhone.length < 10) {
      alert('Enter a valid phone number');
      return;
    }
    
    this.http.post('http://localhost:3000/api/waitlist', { location: this.parkingName, phone: this.waitlistPhone }, this.getHeaders())
      .subscribe({
        next: (res: any) => {
          alert(`You're officially on the waitlist! You are at position #${res.position}. We will SMS you when a spot frees up.`);
          this.waitlistPhone = '';
          this.cdr.detectChanges();
        },
        error: () => alert('Failed to join waitlist')
      });
  }
}
