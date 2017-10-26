import {Component, OnInit, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import {BrokerService} from '../broker/broker.service';
import {NeuroGraphService} from '../neuro-graph.service';
import {Observable} from 'rxjs/Observable';
import {MdDialog} from '@angular/material';
import {cdsMap, allMessages, manyHttpMessages, allHttpMessages} from '../neuro-graph.config';
import {InfoPopupComponent} from './info-popup/info-popup.component'
import moment from 'moment';

@Component({selector: 'app-cds', templateUrl: './cds.component.html', styleUrls: ['./cds.component.scss'], encapsulation: ViewEncapsulation.None})
export class CdsComponent implements OnInit {
  selectedCdsInfo : any = {};
  subscriptions : any;
  cdsInfo : any;
  cdsUserData : any;
  cdsState : Object = {};
  csnState : any = {};
  momentFunc: any;
  constructor(private brokerService : BrokerService, private changeDetector : ChangeDetectorRef, private neuroGraphService : NeuroGraphService, public dialog : MdDialog) {
    this.momentFunc = (moment as any).default ? (moment as any).default : moment;
    this.momentFunc.locale('en');
    this.cdsState = {
      review_relapses: {
        checked: false
      },
      review_mri_images: {
        checked: false
      },
      review_symptom_status: {
        checked: false
      },
      review_ms_type_status: {
        checked: false
      },
      review_dmts: {
        checked: false
      },
      review_monitoring_labs: {
        checked: false
      },
      review_vitamin_d: {
        checked: false
      },
      review_other_meds: {
        checked: false
      },
      review_symptoms_referrals: {
        checked: false
      },
      review_vaccinations: {
        checked: false
      }
    }
  }

  ngOnInit() {
    this.subscriptions = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .subscribe(d => {
        let cdsSource = d.data.artifact;
        let cdsTarget : [any] = cdsMap[cdsSource];
        let checked = d.data.checked;
        checked && (cdsTarget && cdsTarget.forEach(x => this.cdsState[x].checked = true));
        this
          .changeDetector
          .detectChanges();
      });
    let sub1 = this
      .brokerService
      .filterOn(allHttpMessages.httpGetCdsInfo)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : this.cdsInfo = d.data.cds;
      });
    let sub2 = this
      .brokerService
      .filterOn(allHttpMessages.httpGetCdsUserData)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.cdsUserData = d.data.cds;
            this.csnState.csn = this
              .neuroGraphService
              .get('queryParams')
              .csn;
            this.csnState.encounterStatus = this
              .neuroGraphService
              .get('queryParams')
              .encounter_status;
            this.cdsUserData = this
              .cdsUserData
              .find(x => x.save_csn == this.csnState.csn);
            this.setChkBoxes();
          })();
      });
    let sub3 = this
      .brokerService
      .filterOn(allHttpMessages.httpPutCdsUserData)
      .subscribe(d => d.error
        ? console.log(d.error)
        : console.log(d.data));
    let sub4 = this
      .brokerService
      .filterOn(allHttpMessages.httpPostCdsUserData)
      .subscribe(d => d.error
        ? console.log(d.error)
        : console.log(d.data));
    this
      .brokerService
      .httpGet(allHttpMessages.httpGetCdsInfo);
    this
      .brokerService
      .httpGet(allHttpMessages.httpGetCdsUserData);
    this
      .subscriptions
      .add(sub1)
      .add(sub2)
      .add(sub3)
      .add(sub4);
  }

  saveChkBoxesState() {
    this
      .brokerService
      .httpPost(allHttpMessages.httpPostCdsUserData, this.getCdsStateData());
  }

  getCdsStateData() {
    let cdsStateData : any = {};
    Object
      .keys(this.cdsState)
      .forEach(x => {
        this;
        let ret;
        if (this.cdsState[x].checked) {
          cdsStateData[x] = "Yes";
        } else {
          cdsStateData[x] = "No";
        }
      });
    cdsStateData.provider_id = this.cdsUserData.last_updated_provider_id;
    cdsStateData.encounter_csn = this.cdsUserData.save_csn;
    // cdsStateData.updated_instant = '10/10/2017 11:11:11'; // moment().format('MM/DD/YYYY HH:mm:ss');   
    cdsStateData.updated_instant = moment().format('MM/DD/YYYY HH:mm:ss'); 
    return (cdsStateData);
  }

  setChkBoxes() {
    Object
      .keys(this.cdsUserData)
      .map(x => {
        this.cdsState[x] && (this.cdsState[x].checked = ((this.cdsUserData[x] == 'Yes') || (this.cdsState[x].checked))
          ? true
          : false);
      });
    this
      .changeDetector
      .detectChanges();
  }

  changed(event, item) {
    this.saveChkBoxesState();
  }

  openDialog(e, infoTitle) {
    let x = e.clientX;
    let y = e.clientY;
    this.selectedCdsInfo = this
      .cdsInfo
      .find(x => x.label == infoTitle);
    let dialogRef = this
      .dialog
      .open(InfoPopupComponent, {
        backdropClass: 'cds-info-popup-backdrop',
        panelClass: 'cds-info-popup',
        width: '300px',
        data: {
          info: this.selectedCdsInfo,
          x: x,
          y: y
        }
      });
  }

  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }
}