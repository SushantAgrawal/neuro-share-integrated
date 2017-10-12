import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  MdCardModule,
  MatTooltipModule,
  MatSelectModule,
  MatInputModule
} from '@angular/material';

import { DemographicBarComponent } from './demographic-bar/demographic-bar.component';

import { FlexLayoutModule } from '@angular/flex-layout';

import { NotesService } from './services/notes/notes.service';
import { ActivityService } from './services/activity/activity.service';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//Widgets Module
import { WidgetsModule } from '@sutterhealth/widgets';
import { EvalModule, EvalService, EvalEventDirective } from '@sutterhealth/analytics';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    MdCardModule,
    MatTooltipModule,
    WidgetsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    EvalModule.forRoot(),
    MatInputModule
  ],
  declarations: [
    DemographicBarComponent,
  ],
  exports: [
    DemographicBarComponent,
    RouterModule,
    FlexLayoutModule,
    FormsModule
  ],
  providers: [
     NotesService,
     ActivityService,
     EvalService
  ]
})
export class SharedModule { }
