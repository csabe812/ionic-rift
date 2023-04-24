import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CurrencyData } from './currency-data.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private currencyDataSubject = new BehaviorSubject<CurrencyData>(null);

  constructor(private http: HttpClient) {}

  get currencyData() {
    return this.currencyDataSubject.asObservable();
  }

  getCurrencies(
    date: string = new Date().toISOString().split('T')[0],
    symbols: string = encodeURIComponent('USD,GBP,EUR'),
    base: string = 'HUF'
  ) {
    return this.http.get(
      `https://api.apilayer.com/fixer/${date}?symbols=${symbols}&base=${base}`,
      {
        headers: {
          apikey: environment.fixerAPIKey,
        },
      }
    );
  }

  postCurrencyData(currencyData: CurrencyData) {
    return this.http.post(
      `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/currencies.json`,
      {
        ...currencyData,
        id: null,
      }
    );
  }

  getCurrencyData() {
    return this.http
      .get<{ [key: string]: CurrencyData }>(
        `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/currencies.json`
      )
      .pipe(
        map((resp) => {
          let currendyData: CurrencyData;
          for(const i in resp) {
            if(resp.hasOwnProperty(i))  {
              currendyData = new CurrencyData(i, resp[i].date, resp[i].rates);
            }

          }
          this.currencyDataSubject.next(currendyData);
          return currendyData;
        })
      );
  }
}
