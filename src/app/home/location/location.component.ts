import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Leaflet from 'leaflet';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { CountryData } from '../country-data.model';
import { HolidaysService } from '../holidays/holidays.service';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnChanges {
  @Input() longitude: number;
  @Input() latitude: number;
  map: Leaflet.Map;

  constructor(
    private homeService: HomeService,
    private holidayService: HolidaysService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.longitude && this.latitude) {
      this.setMapByCoords();
      this.getLatestCountryData();
    }
  }

  onMapReady(map: Leaflet.Map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  setMapByCoords() {
    Leaflet.Icon.Default.imagePath = 'assets/leaflet/';
    if(this.map) {
      this.map.remove();
    }
    this.map = Leaflet.map('mapId').setView(
      [this.latitude, this.longitude],
      17
    );
    Leaflet.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ).addTo(this.map);
    this.addMapMarker(this.latitude, this.longitude, 'Hello There :-)');
    /*
      const pointA = new Leaflet.LatLng(28.635308, 77.22496);
      const pointB = new Leaflet.LatLng(28.984461, 77.70641);
      const pointList = [pointA, pointB];

      const firstpolyline = new Leaflet.Polyline(pointList, {
          color: 'black',
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1
      });
      firstpolyline.addTo(this.map);
      */
  }

  addMapMarker(lat: number, lng: number, txt: string = '') {
    Leaflet.marker([lat, lng]).addTo(this.map).bindPopup(txt);
  }

  getLatestCountryData() {
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      this.holidayService.fetchHolidays().subscribe((respData) => {
        const holidays = respData.filter((f) => f.userId === userId).reverse();
        if (holidays && holidays.length > 0) {
          this.homeService.getLatestCountryPostionByAnotherBackend().subscribe(
            (resp) => {
              for (const i of holidays) {
                const countryData: CountryData = resp.find(
                  (data) => data.countryName === i.country
                );
                this.addMapMarker(
                  countryData.latitude,
                  countryData.longitude,
                  i.country + ' - ' + i.city
                );
              }
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });
    });
  }
}
