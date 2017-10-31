
import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import * as d3 from 'd3';
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
export class GraphPanelComponent implements OnInit {

  //#region Fields
  @ViewChild('virtualCaseloadInfoTemplate') virtualCaseloadInfoTemplate: TemplateRef<any>;
  state: any;
  subscriptions: any;
  virtualCaseloadInfoDialogRef: MdDialogRef<any>;
  isEdssSelected: boolean = true;
  virtualCaseloadEnabled: boolean = false;
  graphSetting = GRAPH_SETTINGS;
  show: boolean = false;
  toggleObject = {
    'labs': false,
    'imaging': false,
    'relapses': false,
    'symptoms': false,
    'edss': false,
    'walk25feet': false,
    'medication': false
  };
  //#endregion

  //#region Constructor
  constructor(private brokerService: BrokerService, private dialog: MdDialog, private neuroGraphService: NeuroGraphService) {
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
    let sub3 = this.brokerService.filterOn(allMessages.toggleProgress).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.toggleObject[d.data.component] = d.data.state;
        let isTrueCnt = 0;
        Object.keys(this.toggleObject).forEach(key => {
          if (this.toggleObject[key] == true) {
            isTrueCnt++;
          }
        });
        if (isTrueCnt > 0) {
          this.show = true;
        }
        else {
          this.show = false;
        }
      })();
    })
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
    let spanLastDate = new Date((new Date()).getFullYear(), 11, 31);
    this.state.zoomMonthsSpan = +monthsSpan;
    this.state.xDomain = this.getXDomain(+monthsSpan, spanLastDate);
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.graphScaleUpdated, null);
  }

  onResetZoom() {
    this.state.zoomMonthsSpan = 36;
    this.state.xDomain = this.getXDomain(36);
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.graphScaleUpdated, null);
  }
  //#endregion

  //#region State Related
  getXDomain(montsSpan, spanLastDate?) {
    let scaleLastDate = new Date((new Date()).getFullYear(), 11, 31);
    let momentSpanLastDate = this.neuroGraphService.moment(spanLastDate || scaleLastDate);
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

  updateScale() {
    console.log('Current Scale : ' + this.neuroGraphService.moment(this.state.xDomain.currentMinValue).format('MMMM Do YYYY') + ' --- ' + this.neuroGraphService.moment(this.state.xDomain.currentMaxValue).format('MMMM Do YYYY'));
    this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
    this.brokerService.emit(allMessages.graphScaleUpdated, null);
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
    this.updateScale();
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
    this.updateScale();
  }
  //#endregion
}
