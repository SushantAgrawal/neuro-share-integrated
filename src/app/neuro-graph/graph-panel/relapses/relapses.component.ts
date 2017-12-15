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
    for (let i = 2017; i >= 1917; i--) {
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
            try {
              this.relapsesData = d.data.relapses;
              if (d.data && d.data.relapses && d.data.relapses.length > 0) {
                this.createChart();
              }
              else {
                this.relapsesData = [];
              }
              this.relapsisChartLoaded = true;
              if (this.relapsesOpenAddPopUp == true) {
                this.relapsesOpenAddPopUp = false;
                let dt = d3.select('#relapses').selectAll("*");
                this.isDateOutOfRange = false;
                this.relapsesDetail = { month: "", year: "" };
                let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '250px' };
                this.dialogRef = this.dialog.open(this.relapsesAddSecondLevelTemplate, dialogConfig);
                this.dialogRef.updatePosition({ top: '335px', left: '255px' });
              }
              this.brokerService.emit(allMessages.checkboxEnable, 'relapses');

              //custom error handling
              if (!d.data || !d.data.relapses || d.data.relapses.length == 0)
                this.brokerService.emit(allMessages.showCustomError, 'M-002');
              else if (this.relapsesData.some(obj => obj.relapse_month == '' || obj.relapse_year == '' || obj.relapse_month == 'No result' || obj.relapse_year == 'No result'))
                this.brokerService.emit(allMessages.showCustomError, 'D-002');
            }
            catch (ex) {
              console.log(ex);
              this.brokerService.emit(allMessages.showLogicalError, 'relapses');
            }
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
            try {
              let matched = this.relapsesData.find((obj => obj.relapse_id == this.relapsesDetail.relapse_id));
              matched.last_updated_instant = (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year;
              matched.clinician_confirmed = this.relapsesDetail.confirm;
              matched.relapse_month = this.relapsesDetail.month;
              matched.relapse_year = this.relapsesDetail.year;
              this.dialogRef.close();
              this.removeChart();
              this.createChart();
            }
            catch (ex) {
              console.log(ex);
              this.brokerService.emit(allMessages.showLogicalError, 'relapses');
            }
          })();
      })

    let postRelapse = this
      .brokerService
      .filterOn(allHttpMessages.httpPostRelapse)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            try {
              let obj = {
                relapse_id: d.data.relapse_id,
                relapse_month: this.relapsesDetail.month,
                relapse_year: this.relapsesDetail.year,
                last_updated_provider_id: this.paramData.provider_id,
                save_csn: this.paramData.csn,
                save_csn_status: this.paramData.csn_status,
                last_updated_instant: (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year,
                patient_reported: true,
                qx_id: "",
                clinician_confirmed: true,
                relapseaxis: "2.0"
              }
              this.relapsesData.push(obj);
              this.dialogRef.close();
              this.removeChart();
              this.createChart();
            }
            catch (ex) {
              console.log(ex);
              this.brokerService.emit(allMessages.showLogicalError, 'relapses');
            }
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
              this.relapsesDetail.year = "";
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
    let objIndex = this.relapsesData.findIndex((obj => obj.relapse_id == this.relapsesDetail.relapse_id));
    if (objIndex > -1) {
      this.relapsesData.splice(objIndex, 1);
    }
    this.removeChart();
    this.createChart();
  }

  updateChart() {
    if (this.relapsesDetail.year >= new Date().getFullYear() && new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() > new Date().getMonth()) {
      this.isDateOutOfRange = true;
    }
    else {
      let matched = this.relapsesData.find((obj => obj.relapse_id == this.relapsesDetail.relapse_id));
      let obj = {
        pom_id: this.paramData.pom_id.toString(),
        relapse_id: matched.relapse_id,
        provider_id: matched.last_updated_provider_id,
        save_csn: this.paramData.csn,
        save_csn_status: this.paramData.csn_status,
        updated_instant: (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year,
        clinician_confirmed: matched.clinician_confirmed
      };
      this.brokerService.httpPut(allHttpMessages.httpPutRelapse, { selectedRelapse: obj });
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
      if (this.relapsesDetail.year != "" && this.relapsesDetail.month != "") {
        let updatedInstant = (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year;
        let objSave = {
          pom_id: this.paramData.pom_id,
          relapse_month: this.month[new Date(updatedInstant).getMonth()],
          relapse_year: this.relapsesDetail.year,
          provider_id: this.paramData.provider_id,
          save_csn: this.paramData.csn,
          save_csn_status: this.paramData.csn_status,
          updated_instant: (new Date(this.relapsesDetail.month + "/15/" + this.relapsesDetail.year).getMonth() + 1).toString() + "/15/" + this.relapsesDetail.year
        }
        this.brokerService.httpPost(allHttpMessages.httpPostRelapse, objSave);
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
      this.dialogRef.updatePosition({ top: `${d3.event.clientY - 140}px`, left: `${d3.event.clientX - 202}px` });

    }
    else {
      let dialogConfig = { hasBackdrop: true, panelClass: 'ns-relapses-theme', width: '350px' };
      this.dialogRef = this.dialog.open(this.relapsesSecondLevelTemplate, dialogConfig);
      this.dialogRef.updatePosition({ top: `${d3.event.clientY - 130}px`, left: `${d3.event.clientX - 175}px` });
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
