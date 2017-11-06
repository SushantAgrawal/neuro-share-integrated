import { Component, OnInit, Input, ViewEncapsulation, ViewChild, Output, EventEmitter, OnDestroy, TemplateRef } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';
import { BrokerService } from '../../broker/broker.service';
import { NeuroGraphService } from '../../neuro-graph.service';
import { allMessages } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
@Component({
  selector: '[app-shared-grid]',
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SharedGridComponent implements OnInit, OnDestroy {
  @ViewChild('progressNoteTemplate') progressNoteTemplate: TemplateRef<any>;
  @Input() chartState: any;
  subscriptions: any;
  dialogRef: any;
  lastOfficeDateLabel: string;
  constructor(private brokerService: BrokerService, private neuroGraphService: NeuroGraphService, public dialog: MdDialog) {
  }

  //#region Lifecycle events
  ngOnInit() {
    this.drawRootElement(this.chartState);
    this.subscriptions = this.brokerService.filterOn(allMessages.graphScaleUpdated).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.drawRootElement(this.chartState);
      })();
    })
  };

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };
  //#endregion

  //#region Graph Drawing

  drawRootElement(state): void {
    d3.select('#shared-grid').selectAll("*").remove();
    let sharedGridElement = d3.select('#shared-grid');
    let sharedGrid = this.setupSharedGrid(sharedGridElement, state.canvasDimension);
    this.drawScrollArrows(sharedGridElement, state.canvasDimension);
    this.drawVerticalGridLines(sharedGrid, state.canvasDimension, state.xScale);
    this.drawReferenceLines(sharedGrid, state.canvasDimension, state.xScale);
    this.drawCommonXAxis(sharedGrid, state.canvasDimension, state.xScale);
  };

  setupSharedGrid(nodeSelection, dimension) {
    return nodeSelection
      .attr('width', dimension.offsetWidth)
      .attr('height', dimension.offsetHeight)
      .append('g')
      .attr('transform', `translate(${dimension.marginLeft},${dimension.marginTop})`);
  };

  drawCommonXAxis(nodeSelection, dimension, xScale) {
    let xAxis;
    if (this.chartState.zoomMonthsSpan == 6) {
      xAxis = d3.axisBottom(xScale).tickSize(0).ticks(180);
    }
    else if (this.chartState.zoomMonthsSpan == 3) {
      xAxis = d3.axisBottom(xScale).tickSize(0).ticks(90);
    }
    else if (this.chartState.zoomMonthsSpan == 1) {
      xAxis = d3.axisBottom(xScale).tickSize(0).ticks(30);
    }
    else {
      xAxis = d3.axisBottom(xScale).tickSize(0);
    }
    nodeSelection.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimension.width)
      .attr('height', 16)
      .attr('class', 'custom-x-domain');
    let minor = nodeSelection.append('g')
      .attr('class', 'x-axis')
      .call(g => {
        let axis = g.call(xAxis);
        g.select('.domain').remove();
        axis.selectAll('text').style('display', 'none');
        axis.selectAll('text').attr('class', 'mid-year-tick');
        axis.selectAll('text').text((d) => {
          let momentD = this.neuroGraphService.moment(d);
          let midDate = Math.ceil(momentD.daysInMonth() / 2);
          let year = d.getFullYear();
          if (this.chartState.zoomMonthsSpan == 6 || this.chartState.zoomMonthsSpan == 3 || this.chartState.zoomMonthsSpan == 1) {
            return d.getDate() == midDate ? `${this.neuroGraphService.moment.monthsShort(d.getMonth())}, ${year}` : '';
          }
          else {
            return d.getMonth() == 6 ? d.getFullYear() : '';
          }
        });
        axis.selectAll('.mid-year-tick').style('display', 'block').style('font-size', '12px');
      });
  };

  drawReferenceLines(nodeSelection, dimension, xScale) {

    let previousDate = new Date("2/17/2017");
    let dateArray = [
      new Date(), moment(new Date()).add(1, "month"), moment(new Date()).add(2, "month")
    ];
    let i = Math.floor(Math.random() * 3) + 0
    let today = new Date();
    let width = 50;
    let height = 25;
    let lastOfficewidth = 85;
    let lastOfficeheight = 25;
    let lastOfficeLabel1 = "Last";
    let todayLabel1 = "Today's";
    let todayLastLabel = "Office Visit";
    let todayLabel="";
    let currentDate = dateArray[i];
    if (currentDate > new Date()) {
      todayLabel = "Today";
      this.lastOfficeDateLabel = moment(previousDate).format("MM/DD/YYYY");
    }
    else {
      todayLabel = todayLabel1 + " " + todayLastLabel;
      height = 40;
      width = 85;
      this.lastOfficeDateLabel = lastOfficeLabel1 + " " + todayLastLabel;
      lastOfficeheight = 40;
    }

    nodeSelection.append("line")
    .attr("x1", xScale(previousDate))
    .attr("y1", 45)
    .attr("x2", xScale(previousDate))
    .attr("y2", dimension.offsetHeight - dimension.marginTop - dimension.marginBottom)
    .style("stroke-dasharray", "2,2")
    .style("opacity", "0.4")
    .style("stroke", "grey")
    .style("fill", "none");

    if (currentDate > new Date()) {

      let rectPrev = nodeSelection.append("rect")
        .attr("x", xScale(previousDate) - 40)
        .attr("y", "20")
        .attr("width", lastOfficewidth)
        .attr("height", lastOfficeheight)
        .attr("fill", "#EBEBEB");
      let axisTextPrev = nodeSelection.append('text')
        .attr('y', 35)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('cursor', 'pointer')
      axisTextPrev.append('tspan')
        .attr('x', xScale(previousDate) - 30)
        .attr('dy', 0)
        .text(this.lastOfficeDateLabel)
        .on('click', d => {
          this.showSecondLevel();
        })

    }
    else {
      let rectPrev = nodeSelection.append("rect")
        .attr("x", xScale(previousDate) - 40)
        .attr("y", "20")
        .attr("width", lastOfficewidth)
        .attr("height", lastOfficeheight)
        .attr("fill", "#EBEBEB");

      let axisTextPrev = nodeSelection.append('text')
        .attr('y', 35)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('cursor', 'pointer')
      axisTextPrev.append('tspan')
        .attr('x', xScale(previousDate) - 10)
        .attr('dy', 0)
        .text(lastOfficeLabel1)
      axisTextPrev.append('tspan')
        .attr('x', xScale(previousDate) - 30)
        .attr('dy', 15)
        .text(todayLastLabel)
        .on('click', d => {
          this.showSecondLevel();
        })

    }

    nodeSelection.append("line")
    .attr("x1", xScale(today))
    .attr("y1", 45)
    .attr("x2", xScale(today))
    .attr("y2", dimension.offsetHeight - dimension.marginTop - dimension.marginBottom)
    .style("stroke-dasharray", "2,2")
    .style("opacity", "0.4")
    .style("stroke", "grey")
    .style("fill", "none"); 

    if (currentDate > new Date()) {
      let rect = nodeSelection.append("rect")
        .attr("x", xScale(today) - 25)
        .attr("y", "20")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#EBEBEB");

      let axisText = nodeSelection.append('text')
        .attr('y', 35)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
      axisText.append('tspan')
        .attr('x', xScale(today) - 15)
        .attr('dy', 0)
        .text(todayLabel)
    
    }
    else {
      let rect = nodeSelection.append("rect")
        .attr("x", xScale(today) - 40)
        .attr("y", "20")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#EBEBEB");

      let axisText = nodeSelection.append('text')
        .attr('y', 35)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
      axisText.append('tspan')
        .attr('x', xScale(today) - 20)
        .attr('dy', 0)
        .text(todayLabel1)
      axisText.append('tspan')
        .attr('x', xScale(today) - 30)
        .attr('dy', 15)
        .text(todayLastLabel)
     
    }

  };

  showSecondLevel() {
    let dialogConfig = { hasBackdrop: false, width: '350px', height: '350px' };
    this.dialogRef = this.dialog.open(this.progressNoteTemplate, dialogConfig);
    this.dialogRef.updatePosition({ top: '150px', left: '850px' });
  };

  drawVerticalGridLines(nodeSelection, dimension, xScale) {
    let xAxisGridLines;

    if (this.chartState.zoomMonthsSpan == 6) {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0).ticks(6);
    }
    else if (this.chartState.zoomMonthsSpan == 3) {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0).ticks(3);
    }
    else if (this.chartState.zoomMonthsSpan == 1) {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0).ticks(30);
    }
    else {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0);
    }

    nodeSelection.append('g')
      .attr('class', 'grid-lines')
      .call(g => {
        let axis = g.call(xAxisGridLines)
        axis.select('.domain').remove();
        axis.selectAll('text').remove();
        axis.selectAll('line').attr('y2', (d) => {
          if (this.chartState.zoomMonthsSpan == 6) {
            return d.getDate() == 1 ? dimension.offsetHeight : 0;
          }
          else if (this.chartState.zoomMonthsSpan == 3) {
            return d.getDate() == 1 ? dimension.offsetHeight : 0;
          }
          else if (this.chartState.zoomMonthsSpan == 1) {
            //return d.getDate() % 2 == 0 ? dimension.offsetHeight : 0;
            return 0;
          }
          else {
            return d.getMonth() == 0 ? dimension.offsetHeight : 0;
          }
        });
      });
  };

  drawScrollArrows(nodeSelection, dimension) {
    let arc = d3.symbol().type(d3.symbolTriangle).size(100);
    let hAdj = 7;
    let vAdj = 8;
    nodeSelection.append('path')
      .attr('d', arc)
      .attr('class', 'x-axis-arrow')
      .attr('transform', `translate(${dimension.marginLeft - hAdj}, ${dimension.marginTop + vAdj}) rotate(270)`)
      .on('click', d => { this.scroll('backward'); });

    nodeSelection.append('path')
      .attr('d', arc)
      .attr('class', 'x-axis-arrow')
      .attr('transform', `translate(${dimension.marginLeft + dimension.width + hAdj}, ${dimension.marginTop + vAdj}) rotate(90)`)
      .on('click', d => { this.scroll('forward'); });
  };

  scroll(direction) {
    this.brokerService.emit(allMessages.timelineScroll, direction);
  };

  //#endregion
}
