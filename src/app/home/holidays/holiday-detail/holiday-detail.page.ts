import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Holiday } from '../holiday.model';
import { HolidaysService } from '../holidays.service';
import { getData } from 'country-list';

@Component({
  selector: 'app-holiday-detail',
  templateUrl: './holiday-detail.page.html',
  styleUrls: ['./holiday-detail.page.scss'],
})
export class HolidayDetailPage {
  holiday: Holiday;
  isLoading = true;
  members: Map<
    string,
    {
      price: number;
      ratio: number;
      partialPrice;
      fromHowMuch: { name: string; price: number }[];
    }
  >;
  allItems;
  showDetails = false;
  itemsAlreadyLoaded = false;
  showSummary = false;
  sumamryAlreadyLoaded = false;
  countryFlagCode: string;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private authService: AuthService,
    private holidaysService: HolidaysService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('holidayId')) {
        this.navCtrl.navigateBack('/home');
        return;
      }
      const holidayId = paramMap.get('holidayId');
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId
        .pipe(
          take(1),
          switchMap((userId) => {
            if (!userId) {
              throw new Error('Found no user!');
            }
            fetchedUserId = userId;
            return this.holidaysService.getHolidayById(holidayId);
          })
        )
        .subscribe(
          (holiday) => {
            this.countryFlagCode = (getData() as Array<{code: string; name: string}>)
              .find(f => f.name === holiday.country).code.toLowerCase();
            this.holiday = { ...holiday, id: holidayId };
            this.loadItems();
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            this.alertCtrl
              .create({
                header: 'An error ocurred!',
                message: 'Could not load place.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/home']);
                    },
                  },
                ],
              })
              .then((alertEl) => alertEl.present());
          }
        );
    });
  }

  ionViewDidLeave() {
    this.itemsAlreadyLoaded = false;
  }

  loadItems() {
    console.log(!this.itemsAlreadyLoaded);
    if (!this.itemsAlreadyLoaded) {
      this.holidaysService
        .getItemsByHoliday(this.holiday.id)
        .subscribe((data) => {
          console.log(data);
          this.allItems = data;
        });
      this.itemsAlreadyLoaded = !this.itemsAlreadyLoaded;
    } else {
      console.log(this.itemsAlreadyLoaded);
    }
  }

  onAddItem() {
    this.router.navigate([`/home/holidays/${this.holiday.id}/add-item`]);
  }

  onSummarize() {
    this.showSummary = !this.showSummary;

    if (!this.sumamryAlreadyLoaded) {
      this.holidaysService
        .getItemsByHoliday(this.holiday.id)
        .subscribe((data) => {
          const items = data.filter((item) => item.separatable);
          const members = new Map<
            string,
            {
              price: number;
              ratio: number;
              partialPrice;
              fromHowMuch: { name: string; price: number }[];
            }
          >();
          for (const i of this.holiday.member) {
            const filteredItems = items.filter((item) => item.paid === i.name);
            let allExpense = 0;
            for (const fItem of filteredItems) {
              allExpense += fItem.price;
            }
            members.set(i.name, {
              price: allExpense,
              ratio: 0,
              partialPrice: 0,
              fromHowMuch: [],
            });
          }

          let sumOfAllExpense = 0;
          let sumOfPerPerson = 0;
          for (const i of items) {
            sumOfAllExpense += i.price;
          }
          sumOfPerPerson = sumOfAllExpense / members.size;
          let sumOfNegs = 0;
          for (const [key, value] of members) {
            value.partialPrice = value.price - sumOfPerPerson;
            if (value.partialPrice < 0) {
              sumOfNegs += value.partialPrice;
            }
          }
          for (const [key, value] of members) {
            const ratio = value.partialPrice / sumOfNegs;
            value.ratio = ratio >= 0 ? +ratio.toFixed(4) : 0;
          }

          for (const [key, value] of members) {
            if (value.ratio === 0) {
              //számoljuk ki azokat a ratio-kat amelyek nem nullák ehez a 8350-hez
              for (const [k, v] of members) {
                if (v.ratio > 0) {
                  value.fromHowMuch.push({
                    name: k,
                    price: +(value.partialPrice * v.ratio).toFixed(2),
                  });
                }
              }
            }
          }
          this.members = members;
          console.log(members);
        });
      this.sumamryAlreadyLoaded = !this.sumamryAlreadyLoaded;
    }
  }

  onShowDetails() {
    this.showDetails = !this.showDetails;
  }
}
