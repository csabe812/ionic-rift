import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HolidayDetailPage } from './holiday-detail.page';

const routes: Routes = [
  {
    path: '',
    component: HolidayDetailPage
  },
  {
    path: 'add-item',
    loadChildren: () => import('./add-item/add-item.module').then( m => m.AddItemPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HolidayDetailPageRoutingModule {}
