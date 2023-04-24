import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { CurrencyService } from '../currency.service';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  form: FormGroup;
  userData: { defaultCurrency: string; userId: string };
  usd;
  eur;
  gbp;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      currency: new FormControl(),
    });
    this.profileService.getUserDataById().subscribe((data) => {
      this.userData = data;
      this.form.patchValue({
        currency: this.userData.defaultCurrency
      });
    });
    this.currencyService.currencyData.pipe(take(1)).subscribe((data) => {
      if (data && data.rates) {
        this.usd = (
          1 / data.rates.filter((f) => f.key === 'USD')[0].value
        ).toFixed(2);
        this.eur = (
          1 / data.rates.filter((f) => f.key === 'EUR')[0].value
        ).toFixed(2);
        this.gbp = (
          1 / data.rates.filter((f) => f.key === 'GBP')[0].value
        ).toFixed(2);
      }
    });
  }

  onPasswordResetSend() {
    this.authService.email.pipe(take(1)).subscribe((email) => {
      if (!email) {
        return;
      }
      this.authService.sendPasswordResetEmail(email).subscribe((resp) => {
        console.log(resp);
      });
    });
  }

  onSubmit() {
    this.profileService
      .postUserData(this.form.value.currency)
      .subscribe((resp) => console.log(resp));
  }
}
