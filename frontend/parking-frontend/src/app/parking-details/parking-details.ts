import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface ParkingSpot {
  name: string;
  location: string;
  slots: number;
  status: string;
  price?: {
    min: string;
    mid: string;
    max: string;
  };
}

@Component({
  selector: 'app-parking-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-details.html',
  styleUrl: './parking-details.css',
})
export class ParkingDetails implements OnInit {
  parkingSpots: ParkingSpot[] = [
    {
      name: 'T Nagar',
      location: 'South Chennai',
      slots: 5,
      status: 'AVAILABLE',
      price: { min: '8k', mid: '9k', max: '10k' }
    },
    {
      name: 'Anna Nagar',
      location: 'North Chennai',
      slots: 3,
      status: 'AVAILABLE',
      price: { min: '7k', mid: '8k', max: '9k' }
    },
    {
      name: 'Velachery',
      location: 'South and East Chennai',
      slots: 7,
      status: 'AVAILABLE',
      price: { min: '6k', mid: '8k', max: '9k' }
    },
    {
      name: 'Adambakkam',
      location: 'South and East Chennai',
      slots: 2,
      status: 'WAITLIST',
      price: { min: '8k', mid: '9k', max: '10k' }
    },
    {
      name: 'Adyar',
      location: 'South and East Chennai',
      slots: 6,
      status: 'AVAILABLE',
      price: { min: '7k', mid: '10k', max: '12k' }
    },
    {
      name: 'Alandur',
      location: 'South and East Chennai',
      slots: 0,
      status: 'EMPTY',
      price: { min: '2k', mid: '2k', max: '2k' }
    },
    {
      name: 'Guindy',
      location: 'South Chennai',
      slots: 5,
      status: 'AVAILABLE',
      price: { min: '8k', mid: '9k', max: '10k' }
    },
    {
      name: 'Mylapore',
      location: 'Central Chennai',
      slots: 4,
      status: 'AVAILABLE',
      price: { min: '8k', mid: '9k', max: '10k' }
    },
    {
      name: 'Nungambakkam',
      location: 'Central Chennai',
      slots: 6,
      status: 'AVAILABLE',
      price: { min: '9k', mid: '10k', max: '12k' }
    },
    {
      name: 'OMR',
      location: 'South Chennai',
      slots: 10,
      status: 'AVAILABLE',
      price: { min: '5k', mid: '6k', max: '8k' }
    },
    {
      name: 'Thiruvanmiyur',
      location: 'South Chennai',
      slots: 4,
      status: 'AVAILABLE',
      price: { min: '6k', mid: '7k', max: '9k' }
    },
    {
      name: 'Tambaram',
      location: 'South Chennai',
      slots: 8,
      status: 'AVAILABLE',
      price: { min: '4k', mid: '5k', max: '7k' }
    },
    {
      name: 'Mount Road',
      location: 'Central Chennai',
      slots: 5,
      status: 'AVAILABLE',
      price: { min: '10k', mid: '12k', max: '15k' }
    },
    {
      name: 'Besant Nagar',
      location: 'South Chennai',
      slots: 5,
      status: 'AVAILABLE',
      price: { min: '8k', mid: '10k', max: '12k' }
    },
    {
      name: 'Alwarpet',
      location: 'Central Chennai',
      slots: 3,
      status: 'AVAILABLE',
      price: { min: '10k', mid: '12k', max: '15k' }
    }
  ];

  selectedParking: string = '';
  searchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get filteredSpots(): ParkingSpot[] {
    if (!this.searchTerm) return this.parkingSpots;
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.parkingSpots.filter(spot => 
      spot.name.toLowerCase().includes(lowerTerm) || 
      spot.location.toLowerCase().includes(lowerTerm)
    );
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['name']) {
        this.selectedParking = params['name'];
        console.log(`Navigated to parking details for: ${this.selectedParking}`);
      }
    });
  }

  viewDetails(parkingName: string) {
    this.selectedParking = parkingName;
    this.router.navigate(['/parking2', parkingName]);
  }

  goBack() {
    this.router.navigate(['']);
  }
}
