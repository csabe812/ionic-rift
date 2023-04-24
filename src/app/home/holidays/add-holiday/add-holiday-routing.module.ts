import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddHolidayPage } from './add-holiday.page';

const routes: Routes = [
  {
    path: '',
    component: AddHolidayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddHolidayPageRoutingModule {}
