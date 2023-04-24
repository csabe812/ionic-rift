import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from './user.model';
import { Preferences } from '@capacitor/preferences';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  constructor(private http: HttpClient) {}

  get userIsAuthenticated(): Observable<boolean> {
    return this.user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this.user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get email() {
    return this.user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.email;
        } else {
          return null;
        }
      })
    );
  }

  ngOnDestroy(): void {
    if(this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  autoLogin() {
    return from(Preferences.get({ key: 'authData' })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          userId: string;
          tokenExpirationDate: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap((user) => {
        if (user) {
          this.user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map((user) => !!user)
    );
  }

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http
      .post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.user.next(null);
    Preferences.remove({ key: 'authData' });
  }

  sendPasswordResetEmail(
    email: string,
    requestType: string = 'PASSWORD_RESET'
  ) {
    console.log(email);
    return this.http.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${environment.firebaseAPIKey}`,
      {
        email,
        requestType,
      },
      { headers: { 'X-Firebase-Locale': 'hu_HU' } }
    );
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    console.log(expirationTime);
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this.user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = {
      userId,
      token,
      tokenExpirationDate,
      email,
    };
    Preferences.set({
      key: 'authData',
      value: JSON.stringify(data),
    });
  }
}
