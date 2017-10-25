import { Component, OnInit, Input, ViewEncapsulation, ViewChild, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as moment from 'moment';
import { BrokerService } from '../../broker/broker.service';
import { allMessages } from '../../neuro-graph.config';

@Component({
  selector: '[app-shared-grid]',
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SharedGridComponent implements OnInit {
  @Input() private chartState: any;
  private momentFunc: any;
  private subscriptions: any;
  constructor(private brokerService: BrokerService) {
    this.momentFunc = (moment as any).default ? (moment as any).default : moment;
    this.momentFunc.locale('en');
  }

  //#region Lifecycle events
  ngOnInit() {
    this.drawRootElement(this.chartState);
    this.subscriptions = this.brokerService.filterOn(allMessages.zoomOptionChange).subscribe(d => {
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
          if (this.chartState.zoomMonthsSpan == 6) {
            return d.getDate() == 16 ? this.momentFunc.months(d.getMonth()) : '';
          }
          else if (this.chartState.zoomMonthsSpan == 3) {
            return d.getDate() == 16 ? this.momentFunc.months(d.getMonth()) : '';
          }
          else if (this.chartState.zoomMonthsSpan == 1) {
            return d.getDate() == 16 ? this.momentFunc.months(d.getMonth()) : '';
          }
          else {
            return d.getMonth() == 6 ? d.getFullYear() : '';
          }
        });
        axis.selectAll('.mid-year-tick').style('display', 'block').style('font-size', '12px');
      });
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
            return d.getMonth() == 0 ? dimension.offsetHeight : 0;
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
      .on('click', d => { this.scrollLeft(); });

    nodeSelection.append('path')
      .attr('d', arc)
      .attr('class', 'x-axis-arrow')
      .attr('transform', `translate(${dimension.marginLeft + dimension.width + hAdj}, ${dimension.marginTop + vAdj}) rotate(90)`)
      .on('click', d => { this.scrollRight(); });
  };

  scrollLeft() {
  }

  scrollRight() {
  }

  //#region

}
