import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HolidayDetailPageRoutingModule } from './holiday-detail-routing.module';

import { HolidayDetailPage } from './holiday-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HolidayDetailPageRoutingModule
  ],
  declarations: [HolidayDetailPage]
})
export class HolidayDetailPageModule {}
