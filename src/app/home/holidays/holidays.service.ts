import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Item } from './holiday-detail/add-item/Item.model';
import { Holiday } from './holiday.model';

@Injectable({
  providedIn: 'root',
})
export class HolidaysService {
  private holidaysSubject = new BehaviorSubject<Holiday[]>([]);

  constructor(private http: HttpClient) {}

  get holidays() {
    return this.holidaysSubject.asObservable();
  }

  addHoliday(holiday: Holiday) {
    return this.http.post(
      `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/holidays.json`,
      {
        ...holiday,
        id: null,
      }
    );
  }

  editHoliday(holiday: Holiday) {
    return this.http.put(
      `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/holidays/${holiday.id}.json`,
      {
        ...holiday,
      }
    );
  }

  fetchHolidays() {
    return this.http
      .get(
        `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/holidays.json`
      )
      .pipe(
        map((resp) => {
          const holidays = [];
          for (const key in resp) {
            if (resp.hasOwnProperty(key)) {
              holidays.push(
                new Holiday(
                  key,
                  resp[key].country,
                  resp[key].city,
                  resp[key].start,
                  resp[key].member,
                  resp[key].userId
                )
              );
            }
          }
          return holidays;
        }),
        tap((holidays) => {
          this.holidaysSubject.next(holidays);
        })
      );
  }

  getHolidayById(id: string) {
    return this.http.get<Holiday>(
      `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/holidays/${id}.json`
    );
  }

  deleteById(id: string) {
    return this.http.delete(
      `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/holidays/${id}.json`
    );
  }

  addItem(item: Item) {
    return this.http.post(
      `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/items.json`,
      {
        ...item,
        id: null,
      }
    );
  }

  getItemsByHoliday(holidayId: string) {
    return this.http
      .get<{ [key: string]: Item }>(
        `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/items.json?orderBy="holidayId"&equalTo="${holidayId}"`
      )
      .pipe(
        map((data) => {
          const items = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              items.push(
                new Item(
                  key,
                  data[key].title,
                  data[key].price,
                  data[key].paid,
                  data[key].separatable,
                  data[key].holidayId,
                  data[key].currency
                )
              );
            }
          }
          return items;
        })
      );
  }
}
