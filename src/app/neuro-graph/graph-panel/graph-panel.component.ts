
import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import * as d3 from 'd3';
import { ProgressNotesGeneratorService } from '@sutterhealth/progress-notes';
import { BrokerService } from '../broker/broker.service';
import { NeuroGraphService } from '../neuro-graph.service';
import { allMessages, GRAPH_SETTINGS } from '../neuro-graph.config';
import { SharedGridComponent } from '../graph-panel/shared-grid/shared-grid.component';
import { RelapsesComponent } from '../graph-panel/relapses/relapses.component';
import { ImagingComponent } from '../graph-panel/imaging/imaging.component';
import { LabsComponent } from '../graph-panel/labs/labs.component';
import { MedicationsComponent } from '../graph-panel/medications/medications.component';
import { EdssComponent } from '../graph-panel/edss/edss.component';

@Component({
  selector: 'app-graph-panel',
  templateUrl: './graph-panel.component.html',
  styleUrls: ['./graph-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GraphPanelComponent implements OnInit, OnDestroy {

  //#region Fields
  @ViewChild('virtualCaseloadInfoTemplate') virtualCaseloadInfoTemplate: TemplateRef<any>;
  state: any;
  subscriptions: any;
  virtualCaseloadInfoDialogRef: MdDialogRef<any>;
  isEdssSelected: boolean = true;
  virtualCaseloadEnabled: boolean = false;
  defaultScaleSpanInMonths = 36;
  dataBufferStartDate = new Date(2015, 0, 1);
  scaleMinDate = new Date(1970, 0, 1);
  scaleMaxDate = new Date((new Date()).getFullYear(), 11, 31);
  graphSetting = GRAPH_SETTINGS;
  loadingProgressState = {
    labs: false,
    imaging: false,
    relapses: false,
    symptoms: false,
    edss: false,
    walk25feet: false,
    medication: false
  };
  //#endregion

  //#region Constructor
  constructor(
    public brokerService: BrokerService,
    private dialog: MdDialog,
    private neuroGraphService: NeuroGraphService,
    public snackBar: MdSnackBar,
    private progressNotesGeneratorService: ProgressNotesGeneratorService) {
  }
  //#endregion

  //#region Lifecycle events
  ngOnInit() {
    this.setDefaultState();
    let obsEdss = this.brokerService.filterOn(allMessages.neuroRelated).filter(t => (t.data.artifact == 'edss'));
    let sub0 = obsEdss.filter(t => t.data.checked).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          this.isEdssSelected = true;
        })();
    });
    let sub1 = obsEdss.filter(t => !t.data.checked).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          this.isEdssSelected = false;
        })();
    })
    let sub2 = this.brokerService.filterOn(allMessages.timelineScroll).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          this.timelineScroll(d.data);
        })();
    });
    let sub3 = this.brokerService.filterOn(this.brokerService.errorMessageId).subscribe(d => {
      this.showError(d.error);
    });
    this.subscriptions = sub0.add(sub1).add(sub2).add(sub3);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  //#endregion

  //#region UI Event Handlers
  toggleEdssVirtualCaseload() {
    this.virtualCaseloadEnabled = !this.virtualCaseloadEnabled;
    this.brokerService.emit(allMessages.toggleVirtualCaseload, {
      artifact: this.virtualCaseloadEnabled ? "add" : "remove"
    });
  }

  showVirtualCaseloadInfo(e) {
    let dialogConfig = { hasBackdrop: true, panelClass: 'virtual-caseload-info', width: '300px', height: '200px' };
    this.virtualCaseloadInfoDialogRef = this.dialog.open(this.virtualCaseloadInfoTemplate, dialogConfig);
    this.virtualCaseloadInfoDialogRef.updatePosition({ top: `${e.clientY}px`, left: `${e.clientX}px` });
  }

  onZoomOptionChange(monthsSpan) {
    this.state.zoomMonthsSpan = +monthsSpan;
    this.setXDomain(+monthsSpan, this.state.dataBufferPeriod.toDate);
    this.setXScale();
    this.brokerService.emit(allMessages.graphScaleUpdated, { fetchData: false });
  }

  onResetZoom() {
    this.state.zoomMonthsSpan = this.defaultScaleSpanInMonths;
    this.setXDomain(this.defaultScaleSpanInMonths, this.scaleMaxDate);
    this.setXScale();
    this.setDataBufferPeriod('init');
    this.brokerService.emit(allMessages.graphScaleUpdated, { fetchData: true });
  }

  progressNotes() {
    let timestamp = this.neuroGraphService.moment().toString();
    this.progressNotesGeneratorService.pushObject({
      destination: 'progress-note',
      category: 'progress-note',
      source: 'Graph-panel',
      title: 'Graph-panel',
      editable: false,
      draggable: true,
      data: this.getMarkup(),
      timestamp: timestamp,
      overwrite: true
    });
  }

  getMarkup() {
    let graph = document.getElementById("graph-container").innerHTML;
    let output = `<div style="width:710px;height:560px;overflow:hidden;"><svg width="710" height="560">${graph}</svg></div>`;
    return output;
  }
  //#endregion

  //#region State Related
  setXDomain(montsSpan, spanLastDate) {
    let momentSpanLastDate = this.neuroGraphService.moment(spanLastDate);
    let output = {
      scaleMinValue: this.scaleMinDate,
      scaleMaxValue: this.scaleMaxDate,
      currentMinValue: momentSpanLastDate.clone().subtract(montsSpan, 'month').add(1, 'days').toDate(),
      currentMaxValue: spanLastDate
    }
    this.state.xDomain = output;
  }

  setXScale() {
    this.state.xScale = d3.scaleTime()
      .domain([this.state.xDomain.currentMinValue, this.state.xDomain.currentMaxValue])
      .range([0, this.state.canvasDimension.width])
  }

  setDefaultState() {
    this.state = {};
    this.state.canvasDimension = {
      offsetHeight: GRAPH_SETTINGS.panel.offsetHeight,
      offsetWidth: GRAPH_SETTINGS.panel.offsetWidth,
      height: GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom,
      width: GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight,
      marginTop: GRAPH_SETTINGS.panel.marginTop,
      marginRight: GRAPH_SETTINGS.panel.marginRight,
      marginBottom: GRAPH_SETTINGS.panel.marginBottom,
      marginLeft: GRAPH_SETTINGS.panel.marginLeft
    };
    this.state.zoomMonthsSpan = this.defaultScaleSpanInMonths;
    this.setXDomain(this.defaultScaleSpanInMonths, this.scaleMaxDate);
    this.setXScale();
    this.setDataBufferPeriod('init');
  }

  notifyUpdateAndDataShortage() {
    //console.log('Current Scale : ' + this.neuroGraphService.moment(this.state.xDomain.currentMinValue).format('MMMM Do YYYY') + ' --- ' + this.neuroGraphService.moment(this.state.xDomain.currentMaxValue).format('MMMM Do YYYY'));
    //console.log('Data Buffer : ' + this.neuroGraphService.moment(this.state.dataBufferPeriod.fromDate).format('MMMM Do YYYY') + ' --- ' + this.neuroGraphService.moment(this.state.dataBufferPeriod.toDate).format('MMMM Do YYYY'));
    //console.log(this.state.dataBufferPeriod.dataAvailable ? 'data available' : 'need fresh data');
    this.brokerService.emit(allMessages.graphScaleUpdated, { fetchData: !this.state.dataBufferPeriod.dataAvailable });
  }

  setDataBufferPeriod(opMode) {
    if (opMode == 'backward') {
      if (this.state.xDomain.currentMinValue < this.state.dataBufferPeriod.fromDate) {
        let mmtCurrentDataBufferFrom = this.neuroGraphService.moment(this.state.dataBufferPeriod.fromDate);
        let newFromDate = mmtCurrentDataBufferFrom.clone().subtract(this.defaultScaleSpanInMonths, 'month').toDate();
        let newToDate = mmtCurrentDataBufferFrom.clone().subtract(1, 'days').toDate();
        this.state.dataBufferPeriod = {
          fromDate: newFromDate,
          toDate: newToDate,
          dataAvailable: false
        }
      }
      else {
        this.state.dataBufferPeriod.dataAvailable = true;
      }
    }
    else if (opMode == 'forward') {
      if (this.state.xDomain.currentMaxValue > this.state.dataBufferPeriod.toDate) {
        let mmtCurrentDataBufferUpto = this.neuroGraphService.moment(this.state.dataBufferPeriod.toDate);
        let newFromDate = mmtCurrentDataBufferUpto.clone().add(1, 'days').toDate();
        let newToDate = mmtCurrentDataBufferUpto.clone().add(this.defaultScaleSpanInMonths, 'month').toDate();
        this.state.dataBufferPeriod = {
          fromDate: newFromDate,
          toDate: newToDate,
          dataAvailable: false
        }
      }
      else {
        this.state.dataBufferPeriod.dataAvailable = true;
      }
    }
    else {
      this.state.dataBufferPeriod = {
        fromDate: this.dataBufferStartDate,
        toDate: this.scaleMaxDate,
        dataAvailable: true
      }
    }
  }

  //#endregion

  //#region Scroll
  timelineScroll(direction) {
    if (direction == 'forward') {
      this.scrollForward();
    }
    else {
      this.scrollBackward();
    }
  }

  scrollForward() {
    let diff = this.neuroGraphService.moment(this.state.xDomain.currentMaxValue).startOf('day').diff(this.neuroGraphService.moment(this.state.xDomain.scaleMaxValue).startOf('day'), 'days');
    if (diff == 0)
      return;
    let mtNextMonthStart = this.neuroGraphService.moment(this.state.xDomain.currentMaxValue).add(1, 'month').startOf('month');
    let currentMinValue = mtNextMonthStart.clone().toDate();
    let currentMaxValue = mtNextMonthStart.clone().add(this.state.zoomMonthsSpan, 'month').subtract(1, 'days').toDate();
    this.state.xDomain = {
      ...this.state.xDomain,
      currentMinValue,
      currentMaxValue
    };
    this.setXScale();
    this.setDataBufferPeriod('forward');
    this.notifyUpdateAndDataShortage();
  }

  scrollBackward() {
    let diff = this.neuroGraphService.moment(this.state.xDomain.currentMinValue).startOf('day').diff(this.neuroGraphService.moment(this.state.xDomain.scaleMinValue).startOf('day'), 'days');
    if (diff == 0)
      return;
    let mtLastSpanMinDate = this.neuroGraphService.moment(this.state.xDomain.currentMinValue);
    let currentMinValue = mtLastSpanMinDate.clone().subtract(this.state.zoomMonthsSpan, 'month').toDate();
    let currentMaxValue = mtLastSpanMinDate.clone().subtract(1, 'days').toDate();
    this.state.xDomain = {
      ...this.state.xDomain,
      currentMinValue,
      currentMaxValue
    };
    this.setXScale();
    this.setDataBufferPeriod('backward');
    this.notifyUpdateAndDataShortage();
  }
  //#endregion

  //#region Error
  showError(err) {
    this.snackBar.open(err, "Dismiss", {
      duration: 5000,
      extraClasses: ['neuro-error-snackbar']
    });
  }
  //#endregion
}
