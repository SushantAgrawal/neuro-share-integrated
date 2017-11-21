import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages, labsConfig } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { NeuroGraphService } from '../../neuro-graph.service';

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
  private isCollapsed: Boolean = true;
  private dialogRef: any;
  private labsChartLoaded: boolean = false;
  registerDrag: any;
  constructor(private brokerService: BrokerService, public dialog: MdDialog, private neuroGraphService: NeuroGraphService) 
  {
    this.registerDrag = e => neuroGraphService.registerDrag(e);
  }

  ngOnInit() {
    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetLabs)
      .subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error);
            this.brokerService.emit(allMessages.checkboxEnable, 'labs');
          })()
          : (() => {
            //this.labsData = d.data.EPIC.labOrder;
            this.labsData = d.data.EPIC.labOrder.filter(item => labsConfig.some(f => f["Lab Component ID"] == item.procedureCode));
            this.createChart();
            this.labsChartLoaded = true;
            this.brokerService.emit(allMessages.checkboxEnable, 'labs');
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
          ? (() => {
            console.log(d.error)
          })
          : (() => {
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetLabs, [
                {
                  name: 'pom_id',
                  value: this.neuroGraphService.get('queryParams').pom_id
                }
              ]);
          })();
      });

    let sub2 = labs
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.removeChart();
            this.labsChartLoaded = false;
          })();
      })

    //When zoom option changed
    let sub3 = this.brokerService.filterOn(allMessages.graphScaleUpdated).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        if (this.labsChartLoaded) {
          this.removeChart();
          this.createChart();
        }
      })();
    })

    this
      .subscriptions
      .add(sub1)
      .add(sub2)
      .add(sub3);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  showSecondLevel(data) {
    this.labsDataDetails = data.orderDetails;
    let compArray: Array<any> = [];
    this.labsData.map(d => {
      return {
        ...d,
        resultDate: new Date(d.dates.resultDate),
      }
    }).sort((a, b) => a.resultDate - b.resultDate).forEach(element => {
      if (element.component.length > 0) {
        if (element.component.length > 0 && element.dates.resultDate != "" && new Date(element.dates.resultDate) <= new Date(data.orderDetails[0].dates.resultDate)) {
          element.component.forEach(elem => {
            compArray.push(elem);
          });
        }
      }
    });
    this.labsDataDetails.forEach(element => {
      if (element.component.length > 0) {
        element.component.forEach(elem => {
          let selCompArray: Array<any> = [];
          selCompArray = compArray.filter((obj => obj.id == elem.id));
          let trendArray: Array<any> = [];
          let i = 0;
          selCompArray.forEach(elems => {
            i = i + 30;
            let color = "#bfbfbf";
            if (elems.isValueInRange == true) {
              color = "#9dbb61";
            }
            else {
              color = "#e53935";
            }
            if (i <= 90) {
              if (Number(elems.value) && elems.referenceLow != "")
                trendArray.push({ "x": i, "y": Number(elems.value), "color": color })

            }
          });
          if (trendArray.length > 1) {
            elem.trendData = trendArray;
          }
          else {
            elem.trendData = [];
          }

        });
      }
    });

    let dialogConfig = { hasBackdrop: false, skipHide: true, panelClass: 'ns-labs-theme', width: '730px', data: this.labsDataDetails };

    this.dialogRef = this.dialog.open(this.labSecondLevelTemplate, dialogConfig);
    this.dialogRef.afterOpen().subscribe((ref: MdDialogRef<any>) => {
      this.plottrendline();
    });

    this
      .brokerService
      .emit(allMessages.neuroRelated, {
        artifact: 'dmt',
        checked: true
      });
  }
  plottrendline() {
    if (this.labsDataDetails[0].component.length > 0) {
      this.labsDataDetails[0].component.forEach(elems => {
        this.drawtrendLine(this.labsDataDetails[0].procedureCode, elems.id, elems.trendData)
      });
    }

  }
  drawtrendLine(labId, compId, trendData) {
    let maxValue = Math.max.apply(Math, trendData.map(function (o) { return o.y; }));
    let minValue = Math.min.apply(Math, trendData.map(function (o) { return o.y; }))
    let scale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([25, 15]);
    //Chart line
    let line = d3.line<any>()
      .x((d: any) => d.x)
      .y((d: any) => scale(d.y))

    //Drawing container

    let svg = d3
      .select('#TrendLine_' + labId + '_' + compId)
      .append('svg')
      .attr("width", 100)
      .attr("height", 45)

    svg.append('path')
      .datum(trendData)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', "#bfbfbf")
      .style('stroke-width', '1.5')
      .attr('d', line)


    svg.selectAll('.dot')
      .data(trendData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => d.x)
      .attr('cy', d => scale(d.y))
      .attr('r', 4)
      .style("fill", d => {
        return d.color;
      })
      .style('cursor', 'pointer')
      .append("svg:title") // TITLE APPENDED HERE
      .text(function (d) { return d.y; })


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

    d3.select('#labs')
      .append('clipPath')
      .attr('id', 'labs-clip')
      .append('rect')
      .attr("x", 0)
      .attr("y", -GRAPH_SETTINGS.labs.chartHeight / 2)
      .attr("width", this.chartState.canvasDimension.width)
      .attr("height", GRAPH_SETTINGS.labs.chartHeight);

    this.chart = d3.select("#labs")
      .append('g')
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.labs.positionTop + ")")
      .attr("clip-path", "url(#labs-clip)");

    this.pathUpdate = this.chart.append("path")
      .datum([
        { "orderDate": this.chartState.xDomain.currentMinValue },
        { "orderDate": this.chartState.xDomain.currentMaxValue }
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
      .style('cursor', 'pointer')
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
        this.showSecondLevel(d);
      })

    this.chart.append("text")
      .attr("transform", "translate(" + this.chartState.xScale(this.chartState.xDomain.currentMinValue) + "," + "3.0" + ")")
      .attr("dy", 0)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .text("Labs");
  }
}
