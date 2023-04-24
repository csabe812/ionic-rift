import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Holiday } from '../../holiday.model';
import { HolidaysService } from '../../holidays.service';
import { Item } from './Item.model';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.page.html',
  styleUrls: ['./add-item.page.scss'],
})
export class AddItemPage implements OnInit {
  form: FormGroup;
  holiday: Holiday;

  constructor(
    private route: ActivatedRoute,
    private holidaysService: HolidaysService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      let holidayId;
      if (paramMap.has('holidayId')) {
        holidayId = paramMap.get('holidayId');
        this.holidaysService.getHolidayById(holidayId).subscribe((resp) => {
          this.holiday = { ...resp, id: holidayId };
        });
      }
    });

    this.form = new FormGroup({
      title: new FormControl(),
      price: new FormControl(),
      paid: new FormControl(),
      separatable: new FormControl(),
      currency: new FormControl(),
    });
  }

  onSubmit() {
    const item: Item = new Item(
      null,
      this.form.value.title,
      this.form.value.price,
      this.form.value.paid,
      this.form.value.separatable,
      this.holiday.id,
      this.form.value.currency
    );
    this.holidaysService.addItem(item).subscribe((resp) => {
      console.log(resp);
      this.router.navigate([`/home/holidays/${this.holiday.id}`]);
    });
  }
}
