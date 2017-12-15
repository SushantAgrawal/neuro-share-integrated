import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MdTooltipModule,
  MdCardModule,
  MdDialogModule,
  MatInputModule
} from '@angular/material';

// Froala Module
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

import 'hammerjs';

import { AppComponent } from './app.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { TimeoutComponent } from './timeout/timeout.component';
import { FlexLayoutModule } from "@angular/flex-layout";

// App modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SnapshotModule } from './snapshot/snapshot.module';
import { AppRoutingModule } from './core/app-routing.module';


//Eval Module
import { EvalModule, EvalService, EvalEventDirective } from '@sutterhealth/analytics';
import { environment } from '../environments/environment';

//API SDK
import { ServicesSdkModule, SdkService } from "@sutterhealth/data-services";

//Authentication Module
import { AuthenticationModule, AuthenticationService } from '@sutterhealth/user-authentication';
//import { AuthenticationModule, AuthenticationService } from './user-authentication/user-authentication.module';
//Widgets Module
import { WidgetsModule, FeedbackReportComponent } from '@sutterhealth/widgets';

//Patient Concerns
import { PatientConcernsModule } from '@sutterhealth/patient-concerns';

//Progress Notes
import { ProgressNotesModule } from '@sutterhealth/progress-notes';

@NgModule({
  declarations: [
    AppComponent,
    UnauthorizedComponent,
    TimeoutComponent,
  ],
  imports: [
    CoreModule,
    SharedModule,
    SnapshotModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    EvalModule.forRoot(),
    ServicesSdkModule,
    AuthenticationModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    WidgetsModule,
    MdTooltipModule,
    MdCardModule,
    MdDialogModule,
    MatInputModule,
    FlexLayoutModule,
    ProgressNotesModule
  ],
  providers: [EvalService],
  bootstrap: [AppComponent],
  entryComponents: [FeedbackReportComponent]
})

export class AppModule {

  constructor(evalService: EvalService, sdk: SdkService, auth: AuthenticationService){
    
    sdk.setEnvironment(environment.envName);
    evalService.setEnvironment(environment.envName);
    auth.skipValidation(true);
    auth.setMatrix({
      provider: { '': ['view'] },
      psr: { '': ['view'] },
      ma: { '': ['view'] },
      dc: { '': ['view'] },
      do: { '': ['view'] },
      np: { '': ['view'] }
    });

    evalService.sendSessionData({
      contact_serial_number: null,
      instigator_application: '',
      application_name: 'NEURO-SHARE',
      application_version: '1.0',
      component: '',
      component_version: '1.0',
      patient_identifier: null,
      solution: 'NEURO-SHARE',
      solution_version: '1.0',
      username: null,
      trackEval: environment.trackEval
    });
  }
}
