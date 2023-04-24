import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyHolidaysPageRoutingModule } from './holidays-routing.module';

import { HolidaysPage } from './holidays.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyHolidaysPageRoutingModule,
  ],
  declarations: [HolidaysPage],
})
export class HolidaysPageModule {}
