import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { CurrencyData } from './currency-data.model';
import { CurrencyService } from './currency.service';
import { Holiday } from './holidays/holiday.model';
import { HolidaysService } from './holidays/holidays.service';
import { Geolocation as Geoloc } from '@awesome-cordova-plugins/geolocation/ngx';
import { HomeService } from './home.service';
import { getData } from 'country-list';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  holiday: Holiday;
  email: string;
  countryFlagCode: string;
  latitude;
  longitude;

  constructor(
    private holidaysService: HolidaysService,
    private authService: AuthService,
    private router: Router,
    private currencyService: CurrencyService,
    private geolocation: Geoloc,
    private homeService: HomeService
  ) {}

  ionViewWillEnter() {
    this.setEmail();
    this.setCurrentLocation();
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      this.holidaysService.fetchHolidays().subscribe((respData) => {
        const holidays = respData.filter((f) => f.userId === userId).reverse();
        if (holidays && holidays.length > 0) {
          this.holiday = holidays[0];
          this.countryFlagCode = (
            getData() as Array<{ code: string; name: string }>
          )
            .find((f) => f.name === this.holiday.country)
            .code.toLowerCase();
        }
      });
    });

    this.currencyService.getCurrencyData().subscribe((data: any) => {
      if (!this.sameDay(new Date(), new Date(data.date))) {
        this.currencyService.getCurrencies().subscribe((resp: any) => {
          const rates: { key: string; value: number }[] = [];
          for (const k in resp.rates) {
            if (resp.rates.hasOwnProperty(k)) {
              rates.push({ key: k, value: resp.rates[k] });
            }
          }
          this.currencyService
            .postCurrencyData(new CurrencyData(null, new Date(), rates))
            .subscribe();
        });
      }
    });
  }

  setEmail() {
    this.authService.email.subscribe((email) => {
      this.email = email;
    });
  }

  setCurrentLocation() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        this.longitude = resp.coords.longitude;
        this.latitude = resp.coords.latitude;
      })
      .catch((error) => {
        console.log('Error getting location', error);
      });
    const watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
    });
  }

  onLogout() {
    this.authService.logout();
  }

  onMyHoliday() {
    this.router.navigateByUrl(`home/holidays`);
  }

  onMyProfile() {
    this.router.navigateByUrl(`home/profile`);
  }

  onCardClicked() {
    this.router.navigateByUrl(`/home/holidays/${this.holiday.id}`);
  }

  sameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
