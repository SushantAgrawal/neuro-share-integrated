import { Component, OnInit, Input, ViewEncapsulation,ViewChild,Output,EventEmitter } from '@angular/core';
import * as d3 from 'd3';
@Component({
  selector: '[app-shared-grid]',
  templateUrl: './shared-grid.component.html',
  styleUrls: ['./shared-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SharedGridComponent implements OnInit {
  @Input() private chartState: any;
  @Output() menuClicked:EventEmitter<string> = new EventEmitter();
  constructor() { }

  ngOnInit() {
    this.drawRootElement(this.chartState);
  }

  drawRootElement(state): void {
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
  updatePrev()
  {
    
  }
  updateNext()
  {
    
  }
  drawScrollArrows(nodeSelection, dimension) {
    let arc = d3.symbol().type(d3.symbolTriangle).size(100);
    let hAdj = 7;
    let vAdj = 8;
    nodeSelection.append('path')
      .attr('d', arc)
      .attr('class', 'x-axis-arrow')
      .attr('transform', `translate(${dimension.marginLeft - hAdj}, ${dimension.marginTop + vAdj}) rotate(270)`)
      .on('click', d => {this.updatePrev(); });

    nodeSelection.append('path')
      .attr('d', arc)
      .attr('class', 'x-axis-arrow')
      .attr('transform', `translate(${dimension.marginLeft + dimension.width + hAdj}, ${dimension.marginTop + vAdj}) rotate(90)`)
      .on('click', d => {this.updateNext(); });
  };

  //Need to update this method when range is <= 1 Year
  drawCommonXAxis(nodeSelection, dimension, xScale) {
    let xAxis = d3.axisBottom(xScale).tickSize(0);
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
        axis.selectAll('text').attr('class', (d) => {
          return d.getMonth() == 6 ? 'mid-year-tick' : '';
        });
        axis.selectAll('text').text((d) => {
          return d.getMonth() == 6 ? d.getFullYear() : '';
        });
        axis.selectAll('.mid-year-tick').style('display', 'block').style('font-size', '12px');
      });
  };

  drawVerticalGridLines(nodeSelection, dimension, xScale) {
    let xAxisGridLines = d3.axisBottom(xScale).tickSize(0);
    nodeSelection.append('g')
      .attr('class', 'grid-lines')
      .call(g => {
        let axis = g.call(xAxisGridLines)
        axis.select('.domain').remove();
        axis.selectAll('text').remove();
        axis.selectAll('line').attr('y2', (d) => {
          return d.getMonth() == 0 ? dimension.offsetHeight : 0;
        });
      });
  };

}
