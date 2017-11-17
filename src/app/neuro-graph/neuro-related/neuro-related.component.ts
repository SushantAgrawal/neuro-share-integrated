import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { BrokerService } from '../broker/broker.service';
import { allMessages, allHttpMessages, manyHttpMessages } from '../neuro-graph.config';
// import {RelapsesComponent} from '../graph-panel/relapses/relapses.component';
import { EvalService } from '@sutterhealth/analytics';

@Component({ selector: 'app-neuro-related', templateUrl: './neuro-related.component.html', styleUrls: ['./neuro-related.component.scss'], encapsulation: ViewEncapsulation.None })
export class NeuroRelatedComponent implements OnInit {
  display: Boolean = false;
  checkDMT: Boolean = true;
  checkRelapses: Boolean = false;
  checkwalk25Feet: Boolean = false;
  checkEDSS: Boolean = true;
  isEDSSEnable: boolean = true;
  isDMTEnable: boolean = true;
  isRelapsesEnable: boolean = true;
  isWalk25FeetEnable: boolean = true;
  isImagingEnable: boolean = true;
  isSymptomsEnable: boolean = true;
  isLabEnable: boolean = true;
  constructor(private brokerService: BrokerService, private evalService: EvalService) { }

  ngOnInit() {
    let dmt = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'dmt'));

    let sub1 = dmt
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //make api call
            this.checkDMT = true;
          })();
      });

    let relapses = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'relapses'));

    let sub2 = relapses
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //make api call
            this.checkRelapses = true;
          })();
      });

    let edss = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'edss'));

    let sub3 = edss
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //make api call
            this.checkEDSS = true;
          })();
      });

    let walk25Feet = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'walk25Feet'));

    let sub4 = walk25Feet
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //debugger;
            //make api call
            this.checkwalk25Feet = true;
          })();
      });

    let disableData = this
      .brokerService
      .filterOn(allMessages.neuroRelated)

    let sub5 = disableData
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //debugger;
            //make api call
            if (d.data.artifact == 'walk25Feet')
              this.isWalk25FeetEnable = false;
            else if (d.data.artifact == 'relapses')
              this.isRelapsesEnable = false;
            else if (d.data.artifact == 'edss')
              this.isEDSSEnable = false;
            else if (d.data.artifact == 'dmt' || d.data.artifact == 'otherMeds' || d.data.artifact == 'vitaminD')
              this.isDMTEnable = false;
            else if (d.data.artifact == 'imaging')
              this.isImagingEnable = false;
            else if (d.data.artifact == 'symptoms')
              this.isSymptomsEnable = false;
            else if (d.data.artifact == 'labs')
              this.isLabEnable = false;
          })();
      });

    let enableData = this
      .brokerService
      .filterOn(allMessages.checkboxDisable);

    let sub6 = enableData
      .filter(t => t.data.disabled)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            if (d.data.artifact == 'walk25Feet')
              this.isWalk25FeetEnable = true;
            else if (d.data.artifact == 'relapses')
              this.isRelapsesEnable = true;
            else if (d.data.artifact == 'edss')
              this.isEDSSEnable = true;
            else if (d.data.artifact == 'dmt' || d.data.artifact == 'otherMeds' || d.data.artifact == 'vitaminD')
              this.isDMTEnable = true;
            else if (d.data.artifact == 'imaging')
              this.isImagingEnable = true;
            else if (d.data.artifact == 'symptoms')
              this.isSymptomsEnable = true;
            else if (d.data.artifact == 'labs')
              this.isLabEnable = true;
          })();
      });
  }

  ngAfterViewInit() {
    this
      .brokerService
      .emit(allMessages.neuroRelated, {
        artifact: 'dmt',
        checked: true
      });
    this
      .brokerService
      .emit(allMessages.neuroRelated, {
        artifact: 'edss',
        checked: true
      });
    this
      .brokerService
      .emit(allMessages.neuroRelated, {
        artifact: 'labs',
        checked: true
      });
  };

  changed(e, value) {
    let evalData = {
      label: value,
      data: e.checked,
      type: 'checkbox'
    };
    this
      .evalService
      .sendEvent(evalData);
    this
      .brokerService
      .emit(allMessages.neuroRelated, {
        artifact: value,
        checked: e.checked
      });
  }

  openDialog(type) {
    switch (type) {
      case 'relapses':
        this
          .brokerService
          .emit(allMessages.invokeAddRelapses);
        break;
      case 'edss':
        this
          .brokerService
          .emit(allMessages.invokeAddEdss);
        break;
      case 'walk25Feet':
        this
          .brokerService
          .emit(allMessages.invokeAddWalk25Feet);
        break;
      default:
    }
  }
}
