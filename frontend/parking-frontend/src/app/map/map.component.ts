import { Component, AfterViewInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  isDarkMode = false;
  tileLayer!: L.TileLayer;
  mapInstance: any;
  stations = [
    { name: "T Nagar", lat: 13.0418, lng: 80.2337, slots: 5 },
    { name: "Anna Nagar", lat: 13.0850, lng: 80.2101, slots: 3 },
    { name: "Velachery", lat: 12.9815, lng: 80.2180, slots: 7 },
    { name: "Guindy", lat: 13.0067, lng: 80.2206, slots: 5 },
    { name: "Mylapore", lat: 13.0368, lng: 80.2676, slots: 4 },
    { name: "Nungambakkam", lat: 13.0604, lng: 80.2416, slots: 6 },
    { name: "OMR", lat: 12.9151, lng: 80.2300, slots: 10 },
    { name: "Thiruvanmiyur", lat: 12.9863, lng: 80.2594, slots: 4 },
    { name: "Tambaram", lat: 12.9249, lng: 80.1000, slots: 8 },
    { name: "Mount Road", lat: 13.0645, lng: 80.2641, slots: 5 },
    { name: "Besant Nagar", lat: 13.0002, lng: 80.2668, slots: 5 },
    { name: "Alwarpet", lat: 13.0335, lng: 80.2541, slots: 3 }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!(window as any).parkingClickListenerAdded) {
      document.addEventListener('click', (e: any) => {
        if (e.target && e.target.classList.contains('view-btn')) {
          e.preventDefault();
          const targetUrl = e.target.getAttribute('href');
          if (targetUrl) {
            this.ngZone.run(() => {
              console.log('Event delegation routing to:', targetUrl);
              try { document.body.classList.add('fade-out'); } catch (err) {}
              this.router.navigateByUrl(targetUrl).then(() => {
                setTimeout(() => {
                  try { document.body.classList.remove('fade-out'); } catch (err) {}
                }, 300);
              });
            });
          }
        }
      });
      (window as any).parkingClickListenerAdded = true;
    }

    console.log('Map component initialized');
    this.mapInstance = L.map('map').setView([13.0418, 80.2337], 13);

    this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO'
    }).addTo(this.mapInstance);

    const defaultIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.stations.forEach(station => {
      console.log(`Adding marker for ${station.name}`);
      const marker = L.marker([station.lat, station.lng], { icon: defaultIcon }).addTo(this.mapInstance);
      const targetUrl = '/parking2/' + encodeURIComponent(station.name);
      
      marker.bindPopup(`
        <div style="text-align: left; padding: 4px;">
          <h4 style="margin: 0 0 8px 0; font-size: 1.2em; color: #fff; font-weight: 600; font-family: 'Space Grotesk', sans-serif;">${station.name}</h4>
          <p style="margin: 0; color: #00e5ff; font-size: 0.9em; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
            Live Availability
          </p>
          <p style="margin: 8px 0 16px 0; color: #fff; font-weight: 500;">
            <span style="color:#000; font-weight:800; background: #00FF88; padding: 2px 8px; border-radius: 4px; margin-right: 6px;">${station.slots}</span> Spots Open
          </p>
          <a href="${targetUrl}" class="view-btn" style="display: block; width: 100%; box-sizing: border-box; padding: 12px; background: #ff007f; color: #FFFFFF; border: none; border-radius: 6px; text-align: center; text-decoration: none; font-weight: 600; font-size: 0.95em; transition: 0.2s; box-shadow: 0 0 15px rgba(255, 0, 127, 0.4);">
            Book Space
          </a>
        </div>
      `);
    });
    console.log('All markers loaded successfully');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const url = this.isDarkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if(this.tileLayer) this.tileLayer.setUrl(url);
  }

  goToListView() {
    this.router.navigate(['/parking/locations']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  findNearestLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      let nearest = this.stations[0];
      let minDistance = Infinity;

      this.stations.forEach(station => {
        const d = this.calculateDistance(userLat, userLng, station.lat, station.lng);
        if (d < minDistance) {
          minDistance = d;
          nearest = station;
        }
      });
      
      this.mapInstance.flyTo([nearest.lat, nearest.lng], 16, { duration: 1.5 });
      
      L.popup({ autoClose: false, closeOnClick: false })
        .setLatLng([nearest.lat, nearest.lng])
        .setContent(`<div style="padding:10px; text-align:center;">
          <h3 style="margin:0; color:#fff; font-family:'Space Grotesk',sans-serif;">Closest: ${nearest.name}</h3>
          <p style="color:var(--success); margin:5px 0;">GPS Match Found 📌</p>
          <a href="/parking2/${nearest.name}" class="view-btn" style="background:var(--accent-primary); display:block; padding:8px; border-radius:4px; color:#fff; text-decoration:none; margin-top:10px;">Reserve Here</a>
        </div>`)
        .openOn(this.mapInstance);

    }, () => {
      alert("Please allow location access to find nearest parking.");
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }
}