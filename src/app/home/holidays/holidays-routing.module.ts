import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HolidaysPage } from './holidays.page';

const routes: Routes = [
  {
    path: '',
    component: HolidaysPage
  },
  {
    path: 'add-holiday',
    loadChildren: () => import('./add-holiday/add-holiday.module').then( m => m.AddHolidayPageModule)
  },
  {
    path: 'edit-holiday/:holidayId',
    loadChildren: () => import('./add-holiday/add-holiday.module').then( m => m.AddHolidayPageModule)
  },
  {
    path: ':holidayId',
    loadChildren: () => import('./holiday-detail/holiday-detail.module').then( m => m.HolidayDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyHolidaysPageRoutingModule {}
