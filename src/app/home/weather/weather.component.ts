import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnChanges {
  @Input() longitude: number;
  @Input() latitude: number;
  weatherData;

  constructor(private homeService: HomeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.longitude && this.latitude) {
      this.setWeatherData();
    }
  }

  setWeatherData() {
    this.homeService
      .getCurrentWeatherData(this.latitude, this.longitude)
      .subscribe((data) => {
        this.weatherData = data;
      });
  }

  parseTemperature(temp: number) {
    return Math.round(temp);
  }
}
