import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../src/environments/environment';
import { CountryData } from './country-data.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) {}

  getCurrentWeatherData(lat, lon) {
    const apiKey = environment.openWeatherMapAPIKey;
    return this.http.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=hu&appid=${apiKey}&units=metric`
    );
  }

  getLatestCountryPostionByAnotherBackend() {
    return this.http.get<CountryData[]>(
      `http://localhost:3000/api/country-data`
    );
  }
}
