import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

@Component({
  selector: '[app-imaging]',
  templateUrl: './imaging.component.html',
  styleUrls: ['./imaging.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImagingComponent implements OnInit {
  @ViewChild('imagingSecondLevelTemplate') private imagingSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('imagingThirdLevelTemplate') private imagingThirdLevelTemplate: TemplateRef<any>;
  @Input() private chartState: any;
  private chart: any;
  private width: number;
  private height: number;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  private yScale: any;
  private yDomain: Array<number> = [0, 1];
  private lineA: any;
  private pathUpdate: any;
  private subscriptions: any;
  private imagingDataDetails: Array<any>;
  private imagingData: Array<any>;

  private datasetA: Array<any>;
  private datasetB: Array<any> = [];
  private datasetC: Array<any> = [];
  private dialogRef: any;
  private reportDialogRef: any;
  private hasReportIcon: boolean = true;
  private hasBrainIcon: boolean = true;
  constructor(private brokerService: BrokerService, public dialog: MdDialog, public reportDialog: MdDialog) { }

  ngOnInit() {
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetImaging)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.imagingData = d.data.EPIC.patient[0].imagingOrders;
            this.createChart();
          })();
      })

    let imaging = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'imaging'));

    let sub1 = imaging
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetImaging);
          })();
      });

    let sub2 = imaging
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.removeChart();
          })();
      })

    this
      .subscriptions
      .add(sub1)
      .add(sub2);
  }
  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }

  showSecondLevel(data) {
    this.imagingDataDetails = data.orderDetails;
    let dialogConfig = { hasBackdrop: true, skipHide: true, panelClass: 'ns-images-theme', width: '375px' };
    this.dialogRef = this.dialog.open(this.imagingSecondLevelTemplate, dialogConfig);
  }

  showResult() {
    setTimeout(() => {
      let dialogConfig = { hasBackdrop: false, skipHide: true, panelClass: 'ns-images-theme', width: '490px', height: '600px' };
      this.reportDialogRef = this.dialog.open(this.imagingThirdLevelTemplate, dialogConfig);
      this.reportDialogRef.updatePosition({ top: '50px', left: "860px" });
    }, 200);
  }

  removeChart() {
    d3.select('#imaging').selectAll("*").remove();
    this.datasetB = [];
    this.datasetC = [];
  }
  createChart() {
    this.datasetA = this.imagingData.map(d => {
      return {
        ...d,
        orderDate: new Date(d.orderDate),
        axis: 3.0,
        status: d.status,
        orderFormatDate: d.orderDate
      }
    }).sort((a, b) => a.orderDate - b.orderDate);
    for (let k = 0; k < this.datasetA.length; k++) {
      this.datasetC.push(this.datasetA[k]);
    }

    let repeatCount = 0;
    let isComplete = "Empty";

    for (let i = 0; i < this.datasetC.length; i++) {
      for (let j = 0; j < this.datasetC.length; j++) {
        if (this.datasetC[i].orderFormatDate == this.datasetC[j].orderFormatDate) {
          if (repeatCount == 0) {
            if (this.datasetC[j].status == "Completed") {
              isComplete = "Full";
            }

            this.datasetB.push({
              'orderDate': this.datasetC[j].orderDate,
              'status': isComplete,
              'orderDetails': [this.datasetC[j]]
            })
            repeatCount++;
          }
          else {
            if (this.datasetC[j].status != "Completed" && isComplete == "Full") {
              isComplete = "Half";
              this.datasetB[this.datasetB.length - 1].status = isComplete;
            }
            else if (this.datasetC[j].status == "Completed" && isComplete == "Empty") {
              isComplete = "Half";
              this.datasetB[this.datasetB.length - 1].status = isComplete;
            }
            this.datasetB[this.datasetB.length - 1].orderDetails.push(this.datasetC[j]);
            this.datasetC.splice(j, 1);
          }
        }
      }

      repeatCount = 0;
      isComplete = "Empty";
    }
    this.datasetB = this.datasetB.map(d => {
      return {
        ...d,
        orderDate: d.orderDate,
        axis: 3.0,
        status: d.status
      }
    }).sort((a, b) => a.orderDate - b.orderDate);
    let element = d3.select("#imaging");
    this.width = GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight;
    this.height = GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom;

    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([GRAPH_SETTINGS.imaging.chartHeight - 20, 0]);

    this.lineA = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.orderDate))
      .y((d: any) => this.yScale(d.axis));

    this.chart = d3.select("#imaging")
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.imaging.positionTop + ")");

    this.pathUpdate = this.chart.append("path")
      .datum([
        { "orderDate": this.chartState.xDomain.defaultMinValue, "axis": 3.0 },
        { "orderDate": this.chartState.xDomain.defaultMaxValue, "axis": 3.0 }
      ])
      .attr("d", this.lineA)
      .attr("stroke", GRAPH_SETTINGS.imaging.color)
      .attr("stroke-width", "10")
      .attr("opacity", "0.25")
      .attr("fill", "none")
      .attr("class", "lineA")

    let gradImg = this.chart
      .append("defs")
      .append("linearGradient")
      .attr("id", "gradImg")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%");

    gradImg.append("stop").attr("offset", "50%").style("stop-color", GRAPH_SETTINGS.imaging.color);
    gradImg.append("stop").attr("offset", "50%").style("stop-color", "white");

    this.chart.selectAll(".dotA")
      .data(this.datasetB)
      .enter()
      .append("circle")
      .attr("class", "dotA")
      .attr("cx", d => this.chartState.xScale(d.orderDate))
      .attr("cy", d => this.yScale(d.axis))
      .attr("r", 10)
      .attr('class', 'x-axis-arrow')
      .style("stroke", GRAPH_SETTINGS.imaging.color)
      .style("fill", d => {
        let returnColor;
        if (d.status == "Empty") {
          returnColor = "#FFF"
        }
        else if (d.status == "Full") {
          returnColor = GRAPH_SETTINGS.imaging.color
        }
        else {
          returnColor = "url(#gradImg)"
        }
        return returnColor;
      })
      .on('click', d => {
        this.showSecondLevel(d);
      })

    this.chart.append("text")
      .attr("transform", "translate(" + this.chartState.xScale(this.chartState.xDomain.defaultMinValue) + "," + "3.0" + ")")
      .attr("dy", this.yScale(3.0))
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .text("Images");
  }
}

