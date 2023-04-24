import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Holiday } from '../holiday.model';
import { HolidaysService } from '../holidays.service';
import { Member } from '../member.model';
import { getNames } from 'country-list';

@Component({
  selector: 'app-add-holiday',
  templateUrl: './add-holiday.page.html',
  styleUrls: ['./add-holiday.page.scss'],
})
export class AddHolidayPage implements OnInit {
  isAddMode = true;
  holidayId = '';
  form: FormGroup;
  countries: string[];

  constructor(
    private holidaysService: HolidaysService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get controls() {
    return this.form.controls;
  }
  get members() {
    return this.controls.members as FormArray;
  }
  get memberFormGroups() {
    return this.members.controls as FormGroup[];
  }

  ngOnInit() {
    this.countries = getNames().sort();
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('holidayId')) {
        this.isAddMode = false;
        this.holidayId = paramMap.get('holidayId');
        this.holidaysService
          .getHolidayById(this.holidayId)
          .subscribe((holidayData) => {
            this.createForm(holidayData);
          });
      } else {
        this.createForm();
      }
    });
    this.createForm();
  }

  createForm(holiday: Holiday = null) {
    this.form = new FormGroup({
      country: new FormControl(holiday?.country ?? null),
      city: new FormControl(holiday?.city ?? null),
      start: new FormControl(holiday?.start ?? null),
      members: this.createMembers(holiday?.member),
    });
  }

  createMembers(members: Member[]) {
    if (!members) {
      return new FormArray([]);
    } else {
      const membersArray = new FormArray([]);
      for (const member of members) {
        membersArray.push(
          new FormGroup({
            name: new FormControl(member.name),
          })
        );
      }
      return membersArray;
    }
  }

  onAddMember() {
    const members = this.form.controls.members as FormArray;
    members.push(
      new FormGroup({
        name: new FormControl(),
      })
    );
  }

  onSubmit() {
    const members: Member[] = [];
    for (const member of this.memberFormGroups) {
      members.push(new Member(member.value.name, 0));
    }
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      const holiday: Holiday = new Holiday(
        this.isAddMode ? null : this.holidayId,
        this.form.value.country,
        this.form.value.city,
        this.form.value.start,
        members,
        userId
      );
      if (this.isAddMode) {
        this.holidaysService.addHoliday(holiday).subscribe((data) => {
          this.router.navigate(['/home/holidays']);
        });
      } else {
        this.holidaysService.editHoliday(holiday).subscribe((data) => {
          this.router.navigate(['/home/holidays']);
        });
      }
    });
  }
}
