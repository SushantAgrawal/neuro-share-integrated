
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
  subscriptions: any;
  momentFunc: any;
  virtualCaseloadInfoDialogRef: MdDialogRef<any>;
  isEdssSelected: boolean = true;
  virtualCaseloadEnabled: boolean;
  state: any;
  graphSetting = GRAPH_SETTINGS;
  symbolsDialogRef: any;
  symbolsTemplate: any;
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
    let sub2 = this.brokerService.filterOn(allMessages.timelineScroll).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          this.timelineScroll(d.data);
        })();
    });

    this.subscriptions = sub0.add(sub1).add(sub2);
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

  showSymbols(e) {
    let dialogConfig = { hasBackdrop: true, panelClass: 'chart-symbols', width: '225px', height: '375px' };
    this.symbolsDialogRef = this.dialog.open(this.symbolsTemplate, dialogConfig);
    this.symbolsDialogRef.updatePosition({ top: `${e.clientY}px`, left: `${e.clientX}px` });
  }

  onZoomOptionChange(monthsSpan) {
    let spanLastDate = new Date((new Date()).getFullYear(), 11, 31);
    this.state.zoomMonthsSpan = +monthsSpan;
    this.state.xDomain = this.getXDomain(+monthsSpan, spanLastDate);
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.zoomOptionChange, null);
  }

  onResetZoom() {
    this.state.zoomMonthsSpan = 36;
    this.state.xDomain = this.getXDomain(36);
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.zoomOptionChange, null);
  }
  //#endregion

  //#region State Related
  getXDomain(montsSpan, spanLastDate?) {
    let momentSpanLastDate = this.momentFunc(spanLastDate);
    let scaleLastDate = new Date((new Date()).getFullYear(), 11, 31);
    let output = {
      scaleMinValue: new Date(1970, 0, 1),
      scaleMaxValue: scaleLastDate,

      currentMinValue: momentSpanLastDate
        .clone()
        .subtract(montsSpan, 'month')
        .add(1, 'days')
        .toDate(),
      currentMaxValue: spanLastDate || scaleLastDate,

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
    state.xDomain = this.getXDomain(36);
    state.xScale = this.getXScale(state.canvasDimension, state.xDomain);
    return state;
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

  }

  scrollBackward() {

  }
  //#endregion
}
