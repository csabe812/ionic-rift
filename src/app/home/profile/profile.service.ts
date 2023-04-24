import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, mergeMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  postUserData(defaultCurrency: string) {
    return this.authService.userId.pipe(
      take(1),
      mergeMap((userId) =>
        this.http.post(
          `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/profiles.json`,
          {
            defaultCurrency,
            userId,
          }
        )
      )
    );
  }

  getUserDataById() {
    return this.authService.userId.pipe(
      take(1),
      mergeMap((userId) =>
        this.http
          .get(
            `https://ionic-rift-default-rtdb.europe-west1.firebasedatabase.app/profiles.json?orderBy="userId"&equalTo="${userId}"`
          )
          .pipe(
            map((userData) => {
              let currency;
              for (const k in userData) {
                if (userData.hasOwnProperty(k)) {
                  currency = userData[k];
                }
              }
              return currency;
            })
          )
      )
    );
  }
}
