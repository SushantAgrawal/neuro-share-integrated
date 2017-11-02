import { Component, OnInit } from '@angular/core';
import { SessionService, AuthenticationService } from '@sutterhealth/user-authentication'
import { EhrService, SupportService, MsService } from '@sutterhealth/data-services';
import { ActivityService } from '../services/activity/activity.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AppointmentsService } from '../../core/services/appointments.service';
import { EvalModule, EvalService, EvalEventDirective } from '@sutterhealth/analytics';
import {NeuroGraphService} from '../../neuro-graph/neuro-graph.service';

import * as moment from 'moment';

@Component({
  selector: 'demographic-bar',
  templateUrl: './demographic-bar.component.html',
  styleUrls: ['./demographic-bar.component.scss']
})
export class DemographicBarComponent implements OnInit {
  public appConfig = environment;
  public userObject: any;
  public information: string = '';
  data: any = {};
  activity: any = {
    ege: '',
    diseaseStatus: 'Select',
    diseaseType: 'Select',
    statusDisease: 'Select',
    statusType: 'Select'
  };
  public age: number;
  public typesArray: any[] = [
    { name: 'Select', value: 'Select' },
    { name: 'RRMS', value: 'Relapsing Remitting' },
    { name: 'PPMS', value: 'Primary Progressive' },
    { name: 'SPMS', value: 'Secondary Progressive' },
    { name: 'PRMS', value: 'Progressing Relapsing' },
    { name: 'CIS', value: 'Clinically Isolated Syndrome' }];

  public statusDisease = [
    { name: 'Select' },
    { name: 'Active' },
    { name: 'Non Active' }
  ];
  public statusType = [
    { name: 'Select' },
    { name: 'Progressive' },
    { name: 'Non Progressive' }
  ];
  private pomId: string;
  public lastAppointmentWhitMe;
  public showTooltip: boolean=false;
  constructor(private service: EhrService, private support: SupportService, private session: SessionService, private activityService: ActivityService, private router: Router, private auth: AuthenticationService, private msService: MsService, private appoService: AppointmentsService,private neuroGraphService: NeuroGraphService) {
    activityService.activityData$.subscribe(activityObject => {
      Object.assign(this.activity, activityObject);
    });
  }

  ngOnInit() {
    this.neuroGraphService.test();
    this.session.getParams().subscribe(params => {
      if (params['PatID']) {
        let pomId = params['PomId'] ? params['PomId'] : '82043';
        this.msService.getMSPatientData(pomId).subscribe(data => {
          this.activity.age = data.age_of_onset;
          this.activity.diseaseType = data.ms_type;
          this.activity.statusDisease = data.ms_status_1;
          this.activity.statusType = data.ms_status_2;
        });

        this.msService.getMSPatientInfo().subscribe(patInfo => {
          patInfo.text.forEach(item => {
            this.information += item + '\n ';
          });
        });

        this.service.getDemographics(params['PatID']).subscribe(data => {
          if (data.patientDemographics.dateOfBirth) {
            var date = data.patientDemographics.dateOfBirth;
            var splitted = date.split('/');
            var year = splitted[splitted.length - 1];
            var currentYear = moment(new Date()).format('YY');

            if (currentYear < year) {
              splitted[splitted.length - 1] = '19' + year;
              date = splitted.join('/');
            }
            let dob = moment(date, 'MM/DD/YYYY').format('MM/DD/YYYY');
            this.age = moment().diff(dob, 'years');
          }
          if(data.patientDemographics.sex){
            data.patientDemographics.sex = data.patientDemographics.sex.substring(0,1);
          }
          this.data = data.patientDemographics;
        });
      } else {
        this.data = {};
      }
    });

    this.session.getParams().subscribe(params => {
      if (params['Username']) {
        this.support.getProfile(environment.appAPIName, params['Username']).subscribe(user => {
          user = user['users'];
          if (!user || !this.auth.isTokenValidated()) {
            this.router.navigate(['/unauthorized']);
          } else if (user[0]) {
            this.appoService.fetchAppointments('1', params['PatID'], moment().subtract(2, 'years').format('MM/DD/YYYY'), moment().add(6, 'months').format('MM/DD/YYYY'), user[0].provider_id).subscribe(appointments => {
              this.lastAppointmentWhitMe = this.appoService.getLastAppointmentWhitMe();
            });
            this.session.setUser(user[0]);
            this.userObject = user[0];
          }

        }, (error) => this.router.navigate(['/unauthorized']));
      }
    });
  }
  updateActivity() {
    this.activityService.updateActivity(this.activity)
  }
  updateStatus() {
    this.activity.diseaseStatus = `${this.activity.statusDisease} ${this.activity.statusType}`;
    this.activityService.updateActivity(this.activity);
  }
  toggleTooltip(){
    this.showTooltip = !this.showTooltip;
  }
}
