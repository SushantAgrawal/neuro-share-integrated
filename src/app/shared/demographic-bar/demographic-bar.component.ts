import { Component, OnInit } from '@angular/core';
import { SessionService, AuthenticationService } from '@sutterhealth/user-authentication';
import { EhrService, SupportService, MsService } from '@sutterhealth/data-services';
import { ActivityService } from '../services/activity/activity.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AppointmentsService } from '../../core/services/appointments.service';
import { EvalModule, EvalService, EvalEventDirective } from '@sutterhealth/analytics';
//import {NeuroGraphService} from '../../neuro-graph/neuro-graph.service';

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
    age_of_onset: 'Select',
    ms_type: 'Select',
    ms_status_1: 'Select',
    ms_status_2: 'Select'
  };
  public age: number;
  public typesArray: any[] = [
    { name: 'Select', value: 'Select' },
    { name: 'RRMS - Relapsing-Remitting', value: 'Relapsing-Remitting' },
    { name: 'PPMS - Primary Progressive', value: 'Primary Progressive' },
    { name: 'SPMS - Secondary Progressive', value: 'Secondary Progressive' },
    { name: 'PRMS - Progressive-Relapsing', value: 'Progressive-Relapsing' },
    { name: 'CIS - Clinically Isolated Syndrome', value: 'Clinically Isolated Syndrome' }];

  public statusDisease = [
    { name: 'Select' },
    { name: 'Active' },
    { name: 'Not Active' }
  ];
  public statusType = [
    { name: 'Select' },
    { name: 'Progressive' },
    { name: 'Not Progressive' }
  ];
  private pomId: string;
  public lastAppointmentWhitMe;
  public showTooltip: boolean = false;
  encunterClosed: boolean = false;
  msTypeTooltip: string;
  patientName: string;

  constructor(private service: EhrService, private support: SupportService, private session: SessionService, private activityService: ActivityService, private router: Router, private auth: AuthenticationService, private msService: MsService, private appoService: AppointmentsService) {
    activityService.activityData$.subscribe(activityObject => {
      Object.assign(this.activity, activityObject);
    });
  }

  ngOnInit() {
    this.session.getParams().subscribe(params => {
      if (params['PatID']) {
        let pomId = params['PomId'] ? params['PomId'] : '82043';
        this.msService.getMSPatientData(pomId).subscribe(data => {
          this.activity.age_of_onset = data.age_of_onset;
          this.activity.ms_type = data.ms_type;
          this.activity.ms_status_1 = data.ms_status_1;
          this.activity.ms_status_2 = data.ms_status_2;
          this.activity.age_of_onset_last_updated_instant = moment(data['age_of_onset_last_updated_instant']).format('MM/DD/YYYY');
          this.activity.ms_type_last_updated_instant = moment(data['ms_type_last_updated_instant']).format('MM/DD/YYYY');
          this.activity.ms_status_1_last_updated_instant = moment(data['ms_status_1_last_updated_instant']).format('MM/DD/YYYY');
          this.activity.ms_status_2_last_updated_instant = moment(data['ms_status_2_last_updated_instant']).format('MM/DD/YYYY');
          this.msTypeTooltip = `${this.activity.ms_type}\nEntered on: ${this.activity['ms_type_last_updated_instant']}`;
          this.updateActivity('');
        });

        this.msService.getMSPatientInfo().subscribe(patInfo => {
          patInfo.text.forEach(item => {
            this.information += item + '\n ';
          });
        });

        this.service.getDemographics(params['PatID']).subscribe(data => {
          if (data.patientDemographics.name) {
            let middle: string = '';
            let title: string = '';
            if (data.patientDemographics.name.middle.length > 0) {
              middle = `, ${data.patientDemographics.name.middle.substr(0, 1)}`;
            }
            if (data.patientDemographics.name.title.length > 0) {
              title = ` ${data.patientDemographics.name.title}`;
            }
            this.patientName = `${data.patientDemographics.name.last}${title},  ${data.patientDemographics.name.first}${middle}`
          }
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
            this.activity.age = this.age;
            this.updateActivity('');
          }
          if (data.patientDemographics.sex) {
            data.patientDemographics.sex = data.patientDemographics.sex.substring(0, 1);
          }
          this.data = data.patientDemographics;
        });
        if (params['encounter_status'] && params['encounter_status'] === 'close') {
          this.encunterClosed = true;
        }
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
  updateActivity(field_last_updated_instant: string) {
    if (field_last_updated_instant !== '')
      this.activity[field_last_updated_instant] = moment().format('MM/DD/YYYY');
    this.activityService.updateActivity(this.activity, this.encunterClosed);
    this.msTypeTooltip = `${this.activity.ms_type}\nEntered on: ${this.activity['ms_type_last_updated_instant']}`;
  }

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  isValidKey(event) {
    let regex = new RegExp("^[0-9]");
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key) || this.activity['age_of_onset'].toString().length >= 2) {
      event.preventDefault();
      return false;
    }
  }
}
