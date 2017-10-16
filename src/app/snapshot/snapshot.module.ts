import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { SnapshotComponent } from './snapshot.component';

// Patient Concerns component
import { PatientConcernsModule } from '@sutterhealth/patient-concerns';

import { FlexLayoutModule } from "@angular/flex-layout";
import {NeuroGraphModule} from "@sutterhealth/neuro-graph";
//import {NeuroGraphModule} from "../neuro-graph/neuro-graph.module";

import {
  MdTooltipModule,
  MdCardModule,
  MdDialogModule,
  MatInputModule,
  MdListModule,
  MdMenuModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdToolbarModule,
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MdSelectModule,
    MdTooltipModule,
    MdCardModule,
    MdDialogModule,
    PatientConcernsModule.forRoot(),
    MatInputModule,
    FlexLayoutModule,
    NeuroGraphModule
  ],
  declarations: [
     SnapshotComponent
  ]
})
export class SnapshotModule { }
