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
  private relapsesOpenAddPopUp: boolean = false;
  private isDateOutOfRange: boolean = false;
  private relapsisChartLoaded: boolean = false;
  registerDrag: any;
  constructor(private brokerService: BrokerService, public dialog: MdDialog, private neuroGraphService: NeuroGraphService) {
    this.paramData = this.neuroGraphService.get('queryParams')
    this.registerDrag = e => neuroGraphService.registerDrag(e);
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
          ? (() => {
            console.log(d.error);
            this.brokerService.emit(allMessages.checkboxEnable, 'relapses');
          })()
          : (() => {
            this.relapsesData = d.data.relapses;
            this.createChart();
            this.relapsisChartLoaded = true;
            if (this.relapsesOpenAddPopUp == true) {
              this.relapsesOpenAddPopUp = false;
              let dt = d3.select('#relapses').selectAll("*");
              if (dt["_groups"][0].length > 0) {
                this.isDateOutOfRange = false;
                this.relapsesDetail = this.relapsesData[0];
                this.relapsesDetail.month = "";
                this.relapsesDetail.year = "";//new Date().getFullYear().toString();
                let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '250px' };
                this.dialogRef = this.dialog.open(this.relapsesAddSecondLevelTemplate, dialogConfig);
                this.dialogRef.updatePosition({ top: '335px', left: '255px' });
              }
            }
            this.brokerService.emit(allMessages.checkboxEnable, 'relapses');
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
          ? (() => {
            console.log(d.error)
          })
          : (() => {
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetRelapse, [
                {
                  name: 'pom_id',
                  value: this.neuroGraphService.get('queryParams').pom_id
                },
                {
                  name: 'startDate',
                  value: this.neuroGraphService.moment(this.chartState.dataBufferPeriod.fromDate).format('MM/DD/YYYY')
                },
                {
                  name: 'endDate',
                  value: this.neuroGraphService.moment(this.chartState.dataBufferPeriod.toDate).format('MM/DD/YYYY')
                }
              ]);
          })();
      });
    let sub2 = relapses
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.removeChart();
            this.relapsisChartLoaded = false;
          })();
      })
    let sub3 = modal
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            let dt = d3.select('#relapses').selectAll("*");
            if (dt["_groups"][0].length == 0) {
              this.relapsesOpenAddPopUp = true;
              this
                .brokerService
                .emit(allMessages.neuroRelated, {
                  artifact: 'relapses',
                  checked: true
                });
            }
            else {
              this.isDateOutOfRange = false;
              this.relapsesDetail = this.relapsesData[0];
              this.relapsesDetail.month = "";
              this.relapsesDetail.year = "";//new Date().getFullYear().toString();
              let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '250px' };
              this.dialogRef = this.dialog.open(this.relapsesAddSecondLevelTemplate, dialogConfig);
              this.dialogRef.updatePosition({ top: '335px', left: '255px' });
            }

          })();
      })
    //When zoom option changed
    let sub4 = this.brokerService.filterOn(allMessages.graphScaleUpdated).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        if (this.relapsisChartLoaded) {
          this.removeChart();
          this.createChart();
        }
      })();
    })

    this
      .subscriptions
      .add(sub1)
      .add(sub2)
      .add(sub3)
      .add(sub4)
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
    //debugger;
    if (this.relapsesDetail.year >= new Date().getFullYear() && new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() > new Date().getMonth()) {
      this.isDateOutOfRange = true;
    }
    else {
      this.dialogRef.close();
      var objIndex = this.relapsesData.findIndex((obj => obj.relapse_id == this.relapsesDetail.relapse_id));
      this.relapsesData[objIndex].last_updated_instant = (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year;
      this.relapsesData[objIndex].clinician_confirmed = this.relapsesDetail.confirm;
      this.relapsesData[objIndex].relapse_month = this.relapsesDetail.month;
      this.relapsesData[objIndex].relapse_year = this.relapsesDetail.year;
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

  }
  removeChart() {
    d3.select('#relapses').selectAll("*").remove();
  }
  addChart() {
    if (this.relapsesDetail.year >= new Date().getFullYear() && new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() > new Date().getMonth()) {
      this.isDateOutOfRange = true;
    }
    else {
      var obj = {
        "relapse_id": this.relapsesData.length.toString(),
        "relapse_month": this.relapsesDetail.month,// (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString(),
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
      this.dialogRef.close();
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
  }
  showSecondLevel(data) {
    this.relapsesDetail = { ...data };
    if (data.save_csn_status == "Open") {
      this.isEditSelected = false;
      this.isDateOutOfRange = false;
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
    this.isDateOutOfRange = false;
  }
  addChng() {
    this.isDateOutOfRange = false;
  }
  createChart() {
    this.datasetB = this.relapsesData.map(d => {
      let relMonth = this.month.indexOf(d.relapse_month);
      let relYear = parseInt(d.relapse_year);
      return {
        ...d,
        last_updated_instant: d.relapse_month + "/15/" + d.relapse_year,
        lastUpdatedDate: new Date(relYear, relMonth, 15),
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
      .y((d: any) => 0);

    d3.select('#relapses')
      .append('clipPath')
      .attr('id', 'relapses-clip')
      .append('rect')
      .attr("x", 0)
      .attr("y", -GRAPH_SETTINGS.relapse.chartHeight / 2)
      .attr("width", this.chartState.canvasDimension.width)
      .attr("height", GRAPH_SETTINGS.relapse.chartHeight);

    this.chart = d3.select("#relapses")
      .append('g')
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.relapse.positionTop + ")")
      .attr("clip-path", "url(#relapses-clip)");

    this.pathUpdate = this.chart.append("path")
      .datum([
        { "lastUpdatedDate": this.chartState.xDomain.currentMinValue },
        { "lastUpdatedDate": this.chartState.xDomain.currentMaxValue }
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
        return `translate(${(this.chartState.xScale(d.lastUpdatedDate))},0) rotate(180)`;
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
