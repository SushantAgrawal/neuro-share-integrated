import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { NeuroGraphService } from '../../neuro-graph.service';

@Component({
  selector: '[app-relapses]',
  templateUrl: './relapses.component.html',
  styleUrls: ['./relapses.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RelapsesComponent implements OnInit {
  @ViewChild('relapsesSecondLevelTemplate') private relapsesSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('relapsesEditSecondLevelTemplate') private relapsesEditSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('relapsesAddSecondLevelTemplate') private relapsesAddSecondLevelTemplate: TemplateRef<any>;

  @Input() private chartState: any;
  private yDomain: Array<number> = [0, 1];
  private width: number;
  private height: number;
  private yScale: any;
  private years = [];
  private month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private relapsesDetail: any;
  private subscriptions: any;
  private pathUpdate: any;
  private line: any;
  private chart: any;
  private paramData: any;
  private datasetB: Array<any>;
  private dialogRef: any;
  private datasetA: Array<any>;
  private relapsesData: Array<any>;
  private isEditSelected: boolean = false;
  constructor(private brokerService: BrokerService, public dialog: MdDialog, private neuroGraphService: NeuroGraphService) {
    this.paramData = this.neuroGraphService.get('queryParams')
  }
  ngOnInit() {
    for (var i = 2017; i >= 1917; i--) {
      this.years.push(i.toString());
    }
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetRelapse)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.relapsesData = d.data.relapses;
            this.createChart();
          })();
      })
    let relapses = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'relapses'));

    let modal = this
      .brokerService
      .filterOn(allMessages.invokeAddRelapses)

    let putRelapse = this
      .brokerService
      .filterOn(allHttpMessages.httpPutRelapse)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
          })();
      })

    let postRelapse = this
      .brokerService
      .filterOn(allHttpMessages.httpPostRelapse)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {

          })();
      })

    let sub1 = relapses
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetRelapse);
          })();
      });
    let sub2 = relapses
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.removeChart();
          })();
      })
    let sub3 = modal
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            if (typeof this.relapsesData != "undefined" && this.relapsesData != null) {
              this.relapsesDetail = this.relapsesData[0];
              this.relapsesDetail.month = "January";
              this.relapsesDetail.year = new Date().getFullYear().toString();
              let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '250px' };
              this.dialogRef = this.dialog.open(this.relapsesAddSecondLevelTemplate, dialogConfig);
            }
          })();
      })

    this
      .subscriptions
      .add(sub1)
      .add(sub2)
      .add(sub3)
      .add(putRelapse)
      .add(postRelapse);
  }

  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }

  deleteChart() {
    this.dialogRef.close();
    var objIndex = this.relapsesData.findIndex((obj => obj.relapse_id == this.relapsesDetail.relapse_id));
    if (objIndex > -1) {
      this.relapsesData.splice(objIndex, 1);
    }
    this.removeChart();
    this.createChart();
  }
  updateChart() {
    this.dialogRef.close();
    var objIndex = this.relapsesData.findIndex((obj => obj.relapse_id == this.relapsesDetail.relapse_id));
    this.relapsesData[objIndex].last_updated_instant = (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year;
    this.relapsesData[objIndex].clinician_confirmed = this.relapsesDetail.confirm;
    this.relapsesData[objIndex].relapse_month = this.relapsesDetail.month,
      this.relapsesData[objIndex].relapse_year = this.relapsesDetail.year,
      this.removeChart();
    this.createChart();

    let obj = {
      "pom_id": this.paramData.pom_id,
      "relapse_id": this.relapsesData[objIndex].relapse_id,
      "provider_id": this.relapsesData[objIndex].last_updated_provider_id,
      "encounter_csn": this.paramData.csn,
      "updated_instant": (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year,
      "clinician_confirmed": this.relapsesData[objIndex].clinician_confirmed
    };
  }
  removeChart() {
    d3.select('#relapses').selectAll("*").remove();
  }
  addChart() {
    this.dialogRef.close();
    var obj = {
      "relapse_id": this.relapsesData.length.toString(),
      "relapse_month": (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString(),
      "relapse_year": this.relapsesDetail.year,
      "last_updated_provider_id": "",
      "save_csn": this.paramData.csn,
      "save_csn_status": this.paramData.encounter_status,
      "last_updated_instant": (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year,
      "patient_reported": true,
      "qx_id": "",
      "clinician_confirmed": true,
      "relapseaxis": "2.0"
    }

    this.relapsesData.push(obj);
    this.removeChart();
    this.createChart();

    let objSave = {
      "pom_id": this.paramData.pom_id,
      "relapse_month": this.month[new Date(obj.last_updated_instant).getMonth()],
      "relapse_year": this.relapsesDetail.year,
      "provider_id": "",
      "encounter_csn": this.paramData.csn,
      "updated_instant": (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year
    }
  }
  showSecondLevel(data) {
    this.relapsesDetail = data;
    if (data.save_csn_status == "Open") {
      this.isEditSelected = false;
      let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '405px' };
      this.dialogRef = this.dialog.open(this.relapsesEditSecondLevelTemplate, dialogConfig);
    }
    else {
      let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '350px' };
      this.dialogRef = this.dialog.open(this.relapsesSecondLevelTemplate, dialogConfig);
    }
  }

  checkChge() {
    if (this.relapsesDetail.confirm == true) {
      this.relapsesDetail.confirm = false;
    }
    else {
      this.relapsesDetail.confirm = true;
    }
    this.isEditSelected = true;
  }
  valChng() {
    this.isEditSelected = true;
  }
  createChart() {
    this.datasetB = this.relapsesData.map(d => {
      let relMonth = this.month.indexOf(d.relapse_month);
      let relYear = parseInt(d.relapse_year);
      return {
        ...d,
        last_updated_instant: d.relapse_month + "/15/" + d.relapse_year,
        lastUpdatedDate: new Date(relYear, relMonth, 15),
        relapseaxis: 2,
        confirm: d.clinician_confirmed,
        month: d.relapse_month,
        year: d.relapse_year
      }
    }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);

    let element = d3.select("#relapses");
    this.width = GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight;
    this.height = GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom;

    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([GRAPH_SETTINGS.relapse.chartHeight - 20, 0]);

    this.line = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.lastUpdatedDate))
      .y((d: any) => this.yScale(d.relapseaxis));

    this.chart = d3.select("#relapses")
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.relapse.positionTop + ")");

    this.pathUpdate = this.chart.append("path")
      .datum([
        { "lastUpdatedDate": this.chartState.xDomain.defaultMinValue, "relapseaxis": 2.0 },
        { "lastUpdatedDate": this.chartState.xDomain.defaultMaxValue, "relapseaxis": 2.0 }
      ])
      .attr("class", "line")
      .attr("d", this.line)
      .attr("stroke", "red")
      .attr("stroke-width", "1.5")
      .attr("fill", "none");

    let arc = d3.symbol().type(d3.symbolTriangle).size(100);
    this.chart.selectAll(".triangle")
      .data(this.datasetB)
      .enter().append('path')
      .attr('d', arc)
      .attr("class", "triangle")
      .style('cursor', 'pointer')
      .attr('transform', d => {
        return `translate(${(this.chartState.xScale(d.lastUpdatedDate))},${(this.yScale(d.relapseaxis))}) rotate(180)`;
      })
      .style("stroke", "red")
      .style("fill", d => {
        return d.confirm ? 'red' : '#fff';
      })
      .on('click', d => {
        this.showSecondLevel(d);
      })

  }
}
