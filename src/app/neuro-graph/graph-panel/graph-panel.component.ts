
import { Component, OnInit, ViewEncapsulation,ViewChild,TemplateRef } from '@angular/core';
import { GRAPH_SETTINGS } from '../neuro-graph.config';
import * as d3 from 'd3';
import { BrokerService } from '../broker/broker.service';
import { allMessages} from '../neuro-graph.config';
import { MdDialog, MdDialogRef } from '@angular/material';
import { SharedGridComponent } from '../graph-panel/shared-grid/shared-grid.component';
import { RelapsesComponent } from '../graph-panel/relapses/relapses.component';
import { ImagingComponent } from '../graph-panel/imaging/imaging.component';
import { LabsComponent } from '../graph-panel/labs/labs.component';
import {MedicationsComponent} from '../graph-panel/medications/medications.component';
import {EdssComponent} from '../graph-panel/edss/edss.component';
//import moment from 'moment/src/moment.js';
@Component({
  selector: 'app-graph-panel',
  templateUrl: './graph-panel.component.html',
  styleUrls: ['./graph-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GraphPanelComponent implements OnInit {
  @ViewChild('virtualCaseloadInfoTemplate') private virtualCaseloadInfoTemplate: TemplateRef<any>;
  private virtualCaseloadInfoDialogRef: MdDialogRef<any>;
  isEdssSelected: boolean = true;
  toggleVirtualCaseLoad: string = "Add Virtual Caseload";
  private state: any;
  private graphSetting = GRAPH_SETTINGS;

  @ViewChild(SharedGridComponent) childSharedChart:SharedGridComponent;
  @ViewChild(RelapsesComponent) childrelapsesChart:RelapsesComponent;
  @ViewChild(ImagingComponent) childimagesChart:ImagingComponent;
  @ViewChild(LabsComponent) childlabsChart:LabsComponent;
  @ViewChild(MedicationsComponent) childmedicationsChart:MedicationsComponent;
  @ViewChild(EdssComponent) childedssChart:EdssComponent;
  constructor(private brokerService: BrokerService, private dialog: MdDialog, ) { }

  ngOnInit() {
    console.log('graph-panel ngOnInit');
    this.state = this.getDefaultState();

    let edss = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'edss'));

    edss
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            this.isEdssSelected = true;
            this.toggleVirtualCaseLoad = "Add Virtual Caseload";
          })();
      });

    edss
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.isEdssSelected = false;
          })();
      })
  }

  getXDomain(zoomOption) {
    //Currently dates are static. Later will be set dynamically based on zoom options.
     //Calculate range
     //debugger;
    switch (zoomOption){
      case "2 Yrs": return {
        defaultMinValue: new Date(2016, 0, 1),
        defaultMaxValue: new Date(2017, 11, 31),
        currentMinValue: new Date(2016, 0, 1),
        currentMaxValue: new Date(2017, 11, 31)
      };
      case "1 Yr": return {
        defaultMinValue: new Date(2017, 0, 1),
        defaultMaxValue: new Date(2017, 11, 31),
        currentMinValue: new Date(2017, 0, 1),
        currentMaxValue: new Date(2017, 11, 31)
      };
      case "6 M": return {
        defaultMinValue: new Date(2017, 6, 1),
        defaultMaxValue: new Date(2017, 11, 31),
        currentMinValue: new Date(2017, 6, 1),
        currentMaxValue: new Date(2017, 11, 31)
      };
      case "3 M": return {
        defaultMinValue: new Date(2017, 9, 1),
        defaultMaxValue: new Date(2017, 11, 31),
        currentMinValue: new Date(2017, 9, 1),
        currentMaxValue: new Date(2017, 11, 31)
      };
      case "1 M": return {
        defaultMinValue: new Date(2017, 11, 1),
        defaultMaxValue: new Date(2017, 11, 31),
        currentMinValue: new Date(2017, 11, 1),
        currentMaxValue: new Date(2017, 11, 31)
      };
      case "Prev":{
      switch (this.state.zoomVal)
      {
        case "2 Yrs": 
        return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(-2, 'year').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(-2, 'year').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(-2, 'year').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(-2, 'year').toDate()
        };
        case "1 Yr": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(-1, 'year').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(-1, 'year').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(-1, 'year').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(-1, 'year').toDate()
        };
        case "6 M": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(-6, 'month').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(-6, 'month').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(-6, 'month').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(-6, 'month').toDate()
        };
        case "3 M": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(-3, 'month').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(-3, 'month').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(-3, 'month').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(-3, 'month').toDate()
        };
        case "1 M": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(-1, 'month').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(-1, 'month').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(-1, 'month').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(-1, 'month').toDate()
        };
        default: return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(-3, 'year').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(-3, 'year').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(-3, 'year').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(-3, 'year').toDate()
        };
      }
     
    };
      case "Next":{
      switch (this.state.zoomVal)
      {
        case "2 Yrs": 
        return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(2, 'year').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(2, 'year').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(2, 'year').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(2, 'year').toDate()
        };
        case "1 Yr": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(1, 'year').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(1, 'year').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(1, 'year').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(1, 'year').toDate()
        };
        case "6 M": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(6, 'month').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(6, 'month').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(6, 'month').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(6, 'month').toDate()
        };
        case "3 M": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(3, 'month').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(3, 'month').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(3, 'month').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(3, 'month').toDate()
        };
        case "1 M": return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(1, 'month').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(1, 'month').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(1, 'month').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(1, 'month').toDate()
        };
        default: return {
          // defaultMinValue: moment(this.state.xDomain.defaultMinValue).add(3, 'year').toDate(),
          // defaultMaxValue: moment(this.state.xDomain.defaultMaxValue).add(3, 'year').toDate(),
          // currentMinValue: moment(this.state.xDomain.currentMinValue).add(3, 'year').toDate(),
          // currentMaxValue: moment(this.state.xDomain.currentMaxValue).add(3, 'year').toDate()
        };
      }
     
    };
      default: return {
        defaultMinValue: new Date(2015, 0, 1),
        defaultMaxValue: new Date(2017, 11, 31),
        currentMinValue: new Date(2015, 0, 1),
        currentMaxValue: new Date(2017, 11, 31)
      };
    }
     }

  getXScale(dimension, xDomain): any {
    return d3.scaleTime()
      .domain([xDomain.currentMinValue, xDomain.currentMaxValue])
      .range([0, dimension.width])
  }
  menuClicks(message:string):void {
    //debugger;
    //this.state = this.getDefaultState();
    this.menuClick(message);
  }
  menuClick(txt)
  {
   
      this.state.xDomain = this.getXDomain(txt);
      this.state.xScale = this.getXScale(this.state.canvasDimension, this.state.xDomain);
      this.state.zoomVal = txt;
      this.childSharedChart.ngOnInit();
      this.childrelapsesChart.removeChart();
      this.childrelapsesChart.createChart();
      this.childlabsChart.removeChart();
      this.childlabsChart.createChart();
      this.childimagesChart.removeChart();
      this.childimagesChart.createChart();
      this.childmedicationsChart.removeDmt();
      this.childmedicationsChart.drawDmt();
      this.childmedicationsChart.removeOtherMeds();
      this.childmedicationsChart.drawOtherMeds();
      this.childmedicationsChart.removeVitaminD();
      this.childmedicationsChart.drawVitaminD();
      this.childedssChart.removeChart();
      this.childedssChart.drawEdssLineCharts();
     
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
    state.xDomain = this.getXDomain(null);
    state.xScale = this.getXScale(state.canvasDimension, state.xDomain);
    state.zoomVal="";
    return state;
  }

  toggleEdssVirtualCaseload() {
    let value = "";
    if (this.toggleVirtualCaseLoad == "Add Virtual Caseload") {
      this.toggleVirtualCaseLoad = "Remove Virtual Caseload"
      value = "add";
    }
    else {
      this.toggleVirtualCaseLoad = "Add Virtual Caseload"
      value = "remove";
    }

    this
      .brokerService
      .emit(allMessages.virtualCaseload, {
        artifact: value
      });
  }

  showVirtualCaseloadInfo(e) {
    let dialogConfig = { hasBackdrop: false, panelClass: 'virtual-caseload-info', width: '300px', height: '200px' };
    this.virtualCaseloadInfoDialogRef = this.dialog.open(this.virtualCaseloadInfoTemplate, dialogConfig);
    this.virtualCaseloadInfoDialogRef.updatePosition({ top: `${e.clientY}px`, left:`${e.clientX}px` });
  }
}
