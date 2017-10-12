import { Component, OnInit } from '@angular/core';
import { EhrService, MsService } from '@sutterhealth/data-services';
import { SessionService } from '@sutterhealth/user-authentication';
import { EvalService } from '@sutterhealth/analytics';

import * as _ from 'lodash';

@Component({
  selector: 'app-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.scss']
})

export class SnapshotComponent implements OnInit {

  public patientConcernsData;
  public patientName: string;
  public csn: string;

  lastProgressNote: Object = {
    date: {
      creation: null
    },
    htmlText: null
  };

  constructor(private ehr: EhrService, private session: SessionService, private evalService: EvalService,  private msService: MsService, private ehrService: EhrService) {}

  ngOnInit() {
    let blankNote
    this.session.getParams().subscribe(params => {
      if (params['PomId']) {
        this.ehr.getProgressNotes(params['PomId']).subscribe((notes: any) => {
          this.lastProgressNote = Object.assign({}, this.lastProgressNote, _.last(notes));
        });
      }
      if (params['CSN']){
        this.msService.getPatientConcerns(params['PatID']).subscribe(res => {
          this.patientConcernsData = res.Patient_Concerns;
        });
        this.ehrService.getDemographics(params['PatID']).subscribe(data => {
          this.patientName = data.patientDemographics.name.first;
        });
      }
      if (params['CSN']) {
        this.csn = params['CSN'];
      }
      this.evalService.updateSessionData({
        username : params['Username'],
        application_name: 'NEURO-SHARE',
        patient_identifier: params['PatID'],
        uuid: ''
      });
    });
  }
}