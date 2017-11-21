import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { BrokerService } from '../broker/broker.service';
import { allMessages, allHttpMessages, manyHttpMessages } from '../neuro-graph.config';
// import {RelapsesComponent} from '../graph-panel/relapses/relapses.component';
import { EvalService } from '@sutterhealth/analytics';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({ selector: 'app-neuro-related', templateUrl: './neuro-related.component.html', styleUrls: ['./neuro-related.component.scss'], encapsulation: ViewEncapsulation.None })
export class NeuroRelatedComponent implements OnInit, OnDestroy {
  subscriptions: any;
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
  constructor(private brokerService: BrokerService, private evalService: EvalService,private cd: ChangeDetectorRef) { }

  ngOnInit() {
    let dmt = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'dmt'));
    let relapses = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'relapses'));
    let edss = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'edss'));
    let walk25Feet = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'walk25Feet'));

    let sub0 = dmt
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.checkDMT = true;
          })();
      });
    let sub1 = relapses
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.checkRelapses = true;
          })();
      });
    let sub2 = edss
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.checkEDSS = true;
          })();
      });
    let sub3 = walk25Feet
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.checkwalk25Feet = true;
          })();
      });

    let sub4 = this
      .brokerService
      .filterOn(allMessages.checkboxEnable)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.toggleCheckBox(d.data, true);
          })();
      });

    this.subscriptions = sub0
      .add(sub1)
      .add(sub2)
      .add(sub3)
      .add(sub4);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleCheckBox(value, enable) {
    if (value == 'walk25Feet')
      this.isWalk25FeetEnable = enable;
    else if (value == 'relapses')
      this.isRelapsesEnable = enable;
    else if (value == 'edss')
      this.isEDSSEnable = enable;
    else if (value == 'dmt' || value == 'otherMeds' || value == 'vitaminD')
      this.isDMTEnable = enable;
    else if (value == 'imaging')
      this.isImagingEnable = enable;
    else if (value == 'symptoms')
      this.isSymptomsEnable = enable;
    else if (value == 'labs')
      this.isLabEnable = enable;
      this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.brokerService.emit(allMessages.neuroRelated, {
      artifact: 'dmt',
      checked: true
    });
    this.brokerService.emit(allMessages.neuroRelated, {
      artifact: 'edss',
      checked: true
    });
    this.brokerService.emit(allMessages.neuroRelated, {
      artifact: 'labs',
      checked: true
    });

    setTimeout(() => {
      this.isDMTEnable = false;
      this.isEDSSEnable = false;
      this.isLabEnable = false;
    })
  };

  changed(e, value) {
    this.toggleCheckBox(value, !e.checked);

    let evalData = {
      label: value,
      data: e.checked,
      type: 'checkbox'
    };
    this.evalService.sendEvent(evalData);
    this.brokerService.emit(allMessages.neuroRelated, {
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
