
import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import * as d3 from 'd3';
import * as moment from 'moment';
import { BrokerService } from '../broker/broker.service';
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
export class GraphPanelComponent implements OnInit {

  //#region Private fields
  @ViewChild('virtualCaseloadInfoTemplate') private virtualCaseloadInfoTemplate: TemplateRef<any>;
  private subscriptions: any;
  private momentFunc: any;
  private virtualCaseloadInfoDialogRef: MdDialogRef<any>;
  private isEdssSelected: boolean = true;
  private virtualCaseloadEnabled: boolean;
  private state: any;
  private graphSetting = GRAPH_SETTINGS;
  //#endregion

  //#region Constructor
  constructor(private brokerService: BrokerService, private dialog: MdDialog, ) {
    this.momentFunc = (moment as any).default ? (moment as any).default : moment;
    this.momentFunc.locale('en');
  }
  //#endregion

  //#region Lifecycle events
  ngOnInit() {
    this.state = this.getDefaultState();
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
    this.subscriptions = sub0.add(sub1);
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
    let dialogConfig = { hasBackdrop: false, panelClass: 'virtual-caseload-info', width: '300px', height: '200px' };
    this.virtualCaseloadInfoDialogRef = this.dialog.open(this.virtualCaseloadInfoTemplate, dialogConfig);
    this.virtualCaseloadInfoDialogRef.updatePosition({ top: `${e.clientY}px`, left: `${e.clientX}px` });
  }

  onZoomOptionChange(monthsSpan) {
    this.state.zoomMonthsSpan = +monthsSpan;
    this.state.xDomain = this.getXDomain(+monthsSpan, new Date((new Date()).getFullYear(), 11, 31));
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.zoomOptionChange, {
      //This artifact is not being used. TBD
      //artifact: this.state
    });
  }

  onResetZoom() {
    this.state.zoomMonthsSpan = 36;
    this.state.xDomain = this.getXDomain(36, new Date((new Date()).getFullYear(), 11, 31));
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.zoomOptionChange, {
      //This artifact is not being used. TBD
      //artifact: this.state
    });
  }
  //#endregion

  //#region State Related
  getXDomain(montsSpan, lastDate) {
    let momentcurrentYearLastDate = this.momentFunc(lastDate);
    let output = {
      defaultMaxValue: lastDate,
      defaultMinValue: momentcurrentYearLastDate
        .clone()
        .subtract(montsSpan, 'month')
        .add(1, 'days')
        .toDate(),
      currentMaxValue: lastDate,
      currentMinValue: momentcurrentYearLastDate
        .clone()
        .subtract(montsSpan, 'month')
        .add(1, 'days')
        .toDate(),
    }
    return output;
  }

  getXScale(dimension, xDomain): any {
    return d3.scaleTime()
      .domain([xDomain.currentMinValue, xDomain.currentMaxValue])
      .range([0, dimension.width])
  }

  getDefaultState() {
    let state: any = {};
    state.canvasDimension = {
      offsetHeight: GRAPH_SETTINGS.panel.offsetHeight,
      offsetWidth: GRAPH_SETTINGS.panel.offsetWidth,
      height: GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom,
      width: GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight,
      marginTop: GRAPH_SETTINGS.panel.marginTop,
      marginRight: GRAPH_SETTINGS.panel.marginRight,
      marginBottom: GRAPH_SETTINGS.panel.marginBottom,
      marginLeft: GRAPH_SETTINGS.panel.marginLeft
    };
    state.zoomMonthsSpan = 36;
    state.xDomain = this.getXDomain(36, new Date((new Date()).getFullYear(), 11, 31));
    state.xScale = this.getXScale(state.canvasDimension, state.xDomain);
    return state;
  }
  //#endregion
}
