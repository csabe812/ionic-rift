import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding, ToastController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Holiday } from './holiday.model';
import { HolidaysService } from './holidays.service';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.page.html',
  styleUrls: ['./holidays.page.scss'],
})
export class HolidaysPage {
  holidays: Holiday[] = [];

  constructor(
    private holidaysService: HolidaysService,
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      this.holidaysService.fetchHolidays().subscribe((holidaysData) => {
        this.holidays = holidaysData.filter(
          (holiday) => holiday.userId === userId
        );
      });
    });
  }

  onEdit(id: string, slidingItem: IonItemSliding) {
    this.router.navigateByUrl(`/home/holidays/edit-holiday/${id}`);
  }

  onDelete(id: string, slidingItem: IonItemSliding) {
    this.holidaysService.deleteById(id).subscribe((data) => {
      this.holidays = this.holidays.filter((holiday) => holiday.id !== id);
      this.presentToast('Holiday has been deleted successfully!', 'bottom');
    });
  }

  presentToast(message: string, position: 'top' | 'middle' | 'bottom') {
    this.toastController
      .create({
        message,
        duration: 1500,
        position,
      })
      .then((toastEl) => {
        toastEl.present();
      });
  }

  onHolidayItem(id: string) {
    this.router.navigateByUrl(`/home/holidays/${id}`);
  }
}
