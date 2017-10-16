import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

@Component({
  selector: '[app-labs]',
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LabsComponent implements OnInit {
  @ViewChild('labSecondLevelTemplate') private labSecondLevelTemplate: TemplateRef<any>;
  @Input() private chartState: any;
  private chart: any;
  private yScale: any;
  private yDomain: Array<number> = [0, 1];
  private line: any;
  private pathUpdate: any;
  private labsData: Array<any>;
  private labsDataDetails: Array<any>;
  private subscriptions: any;
  //private datasetA: Array<any>;
  //private datasetB: Array<any> = [];
  //private datasetC: Array<any> = [];
  private dialogRef: any;
  constructor(private brokerService: BrokerService, public dialog: MdDialog) { }

  ngOnInit() {
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetLabs)
      .subscribe(d => {
        // debugger;
        d.error
          ? console.log(d.error)
          : (() => {
            this.labsData = d.data.EPIC.labOrder;
            this.createChart();
          })();
      })

    let labs = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'labs'));

    let sub1 = labs
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetLabs);
            // this.createChart();
          })();
      });

    let sub2 = labs
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            console.log(d.data);
            this.removeChart();
          })();
      })

    this
      .subscriptions
      .add(sub1)
      .add(sub2);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  showSecondLevel(data) {
    this.labsDataDetails = data.orderDetails;
    let dialogConfig = { hasBackdrop: false, skipHide: true, panelClass: 'ns-labs-theme', width: '700px', height: '450px' };
    this.dialogRef = this.dialog.open(this.labSecondLevelTemplate, dialogConfig);
  }

  removeChart() {
    d3.select('#labs').selectAll("*").remove();
  }

  createChart() {
    let tempDataset = this.labsData.map(d => {
      return {
        ...d,
        orderDate: new Date(d.dates.orderDate),
        status: d.status,
        orderFormatDate: d.dates.orderDate
      }
    }).sort((a, b) => a.orderDate - b.orderDate);

    let outputCollection = [];
    let repeatCount = 0;
    let isComplete = "Empty";

    for (let i = 0; i < tempDataset.length; i++) {
      for (let j = 0; j < tempDataset.length; j++) {
        if (tempDataset[i].orderFormatDate == tempDataset[j].orderFormatDate) {
          if (repeatCount == 0) {
            if (tempDataset[j].status == "Completed") {
              isComplete = "Full";
            }
            outputCollection.push({
              'orderDate': tempDataset[j].orderDate,
              'status': isComplete,
              'orderDetails': [tempDataset[j]]
            })
            repeatCount++;
          }
          else {
            if (tempDataset[j].status != "Completed" && isComplete == "Full") {
              isComplete = "Half";
              outputCollection[outputCollection.length - 1].status = isComplete;
            }
            else if (tempDataset[j].status == "Completed" && isComplete == "Empty") {
              isComplete = "Half";
              outputCollection[outputCollection.length - 1].status = isComplete;
            }
            outputCollection[outputCollection.length - 1].orderDetails.push(tempDataset[j]);
            tempDataset.splice(j, 1);
          }
        }
      }
      repeatCount = 0;
      isComplete = "Empty";
    }

    let element = d3.select("#labs");
    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([GRAPH_SETTINGS.labs.chartHeight - 20, 0]);
    this.line = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.orderDate))
      .y(0);
    this.chart = d3.select("#labs")
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.labs.positionTop + ")");
    this.pathUpdate = this.chart.append("path")
      .datum([
        { "orderDate": this.chartState.xDomain.defaultMinValue },
        { "orderDate": this.chartState.xDomain.defaultMaxValue }
      ])
      .attr("d", this.line)
      .attr("stroke", GRAPH_SETTINGS.labs.color)
      .attr("stroke-width", "10")
      .attr("opacity", "0.25")
      .attr("fill", "none")
      .attr("class", "line")

    let gradLab = this.chart
      .append("defs")
      .append("linearGradient")
      .attr("id", "gradLab")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "100%")
      .attr("y2", "0%");

    gradLab.append("stop").attr("offset", "50%").style("stop-color", GRAPH_SETTINGS.labs.color);
    gradLab.append("stop").attr("offset", "50%").style("stop-color", "white");

    this.chart.selectAll(".dot")
      .data(outputCollection)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => this.chartState.xScale(d.orderDate))
      .attr("cy", 0)
      .attr("r", 10)
      .attr('class', 'x-axis-arrow')
      .style("stroke", GRAPH_SETTINGS.labs.color)
      .style("fill", d => {
        let returnColor;
        if (d.status == "Empty") {
          returnColor = "#FFF"
        }
        else if (d.status == "Full") {
          returnColor = GRAPH_SETTINGS.labs.color
        }
        else {
          returnColor = "url(#gradLab)"
        }
        return returnColor;
      })
      .on('click', d => {
        //this.showSecondLevel(d);
      })

    this.chart.append("text")
      .attr("transform", "translate(" + this.chartState.xScale(this.chartState.xDomain.defaultMinValue) + "," + "3.0" + ")")
      .attr("dy", 0)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .text("Labs");
  }
}
