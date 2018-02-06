import { Component, OnInit, Input, ViewEncapsulation, ViewChild, Output, EventEmitter, OnDestroy, TemplateRef } from '@angular/core';
import * as d3 from 'd3';
import { BrokerService } from '../../broker/broker.service';
import { NeuroGraphService } from '../../neuro-graph.service';
import { allMessages, allHttpMessages } from '../../neuro-graph.config';
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
  encounterData: any;
  progressNotes: Array<any>;
  previousDateCSN: any;
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
    let sub1 = this
      .brokerService.filterOn(allHttpMessages.httpGetEncounters).subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error)
          })
          : (() => {
            try {
              let encounters: Array<any> = [];
              if (d.data && d.data.EPIC && d.data.EPIC.encounters) {
                encounters = d.data.EPIC.encounters;
              }
              let filteredEncounter = encounters.filter(t => t.contactType == 'Office Visit');
              this.encounterData = filteredEncounter.map(d => {
                return {
                  ...d,
                  date: new Date(d.date),
                }
              }).sort((a, b) => b.date - a.date);

              let sharedGridElement = d3.select('#shared-grid');
              let sharedGrid = this.setupSharedGrid(sharedGridElement, this.chartState.canvasDimension);

              if (this.encounterData.length > 0) {
                this.drawReferenceLines(sharedGrid, this.chartState.canvasDimension, this.chartState.xScale);
              }
            }
            catch (ex) {
              console.log(ex);
              this.brokerService.emit(allMessages.showLogicalError, 'encounter');
            }
          })();
      });

    let sub2 = this.brokerService.filterOn(allHttpMessages.httpGetProgressNote)
      .subscribe(d => {
        d.error ? (() => { console.log(d.error) }) : (() => {
          d.data && d.data.EPIC && (this.progressNotes = d.data.EPIC.notes.filter((item => ((item.contactSerialNumber) ? item.contactSerialNumber.toString() : '') == this.previousDateCSN.toString())));
          this.showNotes();
        })();
      })
    this.subscriptions.add(sub1).add(sub2);
  };

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  };
  //#endregion

  //#region Graph Drawing

  showNotes() {
    // this.progressNotes.forEach(element => {
    //   if (element.text.length > 0 && element.text[0].indexOf('{\\rtf') > -1) {
    //     element.text = '<i>Progress note currently unavailable. Please see EPIC.</i>';
    //   }
    // });
    let dialogConfig = { hasBackdrop: false, panelClass: 'ns-default-dialog', width: '375px', height: '350px' };
    this.dialogRef = this.dialog.open(this.progressNoteTemplate, dialogConfig);
    this.dialogRef.updatePosition({ top: '150px', left: '850px' });
  }

  getReferenceLineData() {
    this.brokerService.httpGet(allHttpMessages.httpGetEncounters, [
      {
        name: 'pom-id',
        value: this.neuroGraphService.get('queryParams').pom_id
      },
      {
        name: 'startDate',
        value: this.neuroGraphService.moment(this.chartState.dataBufferPeriod.fromDate).format('MM/DD/YYYY')
      },
      {
        name: 'endDate',
        value: this.neuroGraphService.moment(this.chartState.xDomain.scaleMaxValue).format('MM/DD/YYYY')
      }
    ]);
  };

  getProgessNoteData(lastVisitDate) {
    if (this.dialogRef) {
      this.dialogRef.close()
    }
    if (!this.progressNotes || this.progressNotes.length == 0) {
      this.brokerService.httpGet(allHttpMessages.httpGetProgressNote, [
        {
          name: 'pom-id',
          value: this.neuroGraphService.get('queryParams').pom_id
        },
        {
          name: 'note-category',
          value: 'Progress Notes'
        },
        {
          name: 'start-date',
          value: this.neuroGraphService.moment(lastVisitDate).subtract(2, 'days').format('MM/DD/YYYY')
        },
        {
          name: 'end-date',
          value: this.neuroGraphService.moment(lastVisitDate).format('MM/DD/YYYY')
        }
      ]);
    }
    else {
      this.showNotes();
    }
  };

  drawRootElement(state): void {
    d3.select('#shared-grid').selectAll("*").remove();
    let sharedGridElement = d3.select('#shared-grid');
    let sharedGrid = this.setupSharedGrid(sharedGridElement, state.canvasDimension);
    this.drawScrollArrows(sharedGridElement, state.canvasDimension);
    this.drawVerticalGridLines(sharedGrid, state.canvasDimension, state.xScale);
    this.drawCommonXAxis(sharedGrid, state.canvasDimension, state.xScale);
    this.getReferenceLineData();

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
    if (this.chartState.zoomMonthsSpan == 1) {
      xAxis = d3.axisBottom(xScale).tickSize(0).ticks(30);
    }
    else if (this.chartState.zoomMonthsSpan == 6) {
      xAxis = d3.axisBottom(xScale).tickSize(0).ticks(180);
    }
    else if (this.chartState.zoomMonthsSpan == 3) {
      xAxis = d3.axisBottom(xScale).tickSize(0).ticks(90);
    }
    else {
      xAxis = d3.axisBottom(xScale).tickSize(0);
    }
    nodeSelection.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimension.width)
      .attr('height', 16)
      .attr('class', 'custom-x-domain')
      .attr('fill', '#EBEBEB');
    let minor = nodeSelection.append('g')
      .attr('class', 'x-axis')
      .call(g => {
        let axis = g.call(xAxis);
        g.select('.domain').remove();

        axis.selectAll('text').style('display', 'none').style('font-weight', 'bold');
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

  drawVerticalGridLines(nodeSelection, dimension, xScale) {
    let xAxisGridLines;

    if (this.chartState.zoomMonthsSpan == 1) {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0).ticks(30);
    }
    else if (this.chartState.zoomMonthsSpan == 6 || this.chartState.zoomMonthsSpan == 3) {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0).ticks(this.chartState.zoomMonthsSpan);
    }
    else {
      xAxisGridLines = d3.axisBottom(xScale).tickSize(0).ticks(this.chartState.zoomMonthsSpan);
    }

    nodeSelection.append('g')
      .attr('class', 'grid-lines')
      .call(g => {
        let axis = g.call(xAxisGridLines)
        axis.select('.domain').remove();
        axis.selectAll('text').remove();

        axis.selectAll('line')
          .style('stroke-width', '1px')
          .style('stroke', (d) => {
            return d.getMonth() == 0 ? '#bbb4b4' : '#E4E4E4';
          });

        axis.selectAll('line')
          .attr('y2', (d) => {
            if (this.chartState.zoomMonthsSpan == 1) {
              return 0;
            }
            else if (this.chartState.zoomMonthsSpan == 6 || this.chartState.zoomMonthsSpan == 3) {
              return d.getDate() == 1 ? dimension.offsetHeight - 10 : 0;
            }
            else {
              return dimension.offsetHeight - 10;
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
      .style('fill', '#C8C8C8')
      .style('cursor', 'pointer')
      .attr('transform', `translate(${dimension.marginLeft - hAdj}, ${dimension.marginTop + vAdj}) rotate(270)`)
      .on('click', d => { this.scroll('backward'); });

    nodeSelection.append('path')
      .attr('d', arc)
      .attr('class', 'x-axis-arrow')
      .style('fill', '#C8C8C8')
      .style('cursor', 'pointer')
      .attr('transform', `translate(${dimension.marginLeft + dimension.width + hAdj}, ${dimension.marginTop + vAdj}) rotate(90)`)
      .on('click', d => { this.scroll('forward'); });
  };

  scroll(direction) {
    this.brokerService.emit(allMessages.timelineScroll, direction);
  };

  drawReferenceLines(nodeSelection, dimension, xScale) {
    let previousDate: any;
    if (this.encounterData.length > 1) {
      previousDate = new Date(this.encounterData[1].date)
      this.previousDateCSN = this.encounterData[1].contactSerialNumber;
    }
    let today = new Date();
    let width = 50;
    let height = 25;
    let lastOfficewidth = 85;
    let lastOfficeheight = 25;
    let lastOfficeLabel1 = "Last";
    let todayLabel1 = "Today's";
    let todayLastLabel = "Office Visit";
    let todayLabel = "";
    let currentDate = new Date(this.encounterData[0].date);
    if (today > currentDate) {
      previousDate = currentDate;
    }

    if (today > currentDate) {
      todayLabel = "Today";
      this.lastOfficeDateLabel = this.neuroGraphService.moment(previousDate).format("MM/DD/YYYY");
    }
    else {
      todayLabel = todayLabel1 + " " + todayLastLabel;
      height = 40;
      width = 85;
      this.lastOfficeDateLabel = lastOfficeLabel1 + " " + todayLastLabel;
      lastOfficeheight = 40;
    }

    nodeSelection.append('clipPath')
      .attr('id', 'ref-line-clip')
      .append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.chartState.canvasDimension.width)
      .attr("height", dimension.offsetHeight)

    nodeSelection.append("line")
      .attr("clip-path", "url(#ref-line-clip)")
      .attr("x1", xScale(previousDate))
      .attr("y1", 15)
      .attr("x2", xScale(previousDate))
      .attr("y2", dimension.offsetHeight - dimension.marginTop - dimension.marginBottom)
      .style("stroke-dasharray", "2,2")
      .style("opacity", "0.4")
      .style("stroke", "#000")
      .style("fill", "none");

    if (today > currentDate) {
      let rectPrev = nodeSelection.append("rect")
        .attr("x", xScale(previousDate) - 85)
        .attr("y", "20")
        .attr("width", lastOfficewidth)
        .attr("height", lastOfficeheight)
        .attr("fill", "#EBEBEB")
        .attr('stroke', '#BCBCBC')
        .style('cursor', 'pointer')
        .on('click', d => {
          this.getProgessNoteData(previousDate);
        });
      let axisTextPrev = nodeSelection.append('text')
        .attr('y', 35)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
      axisTextPrev.append('tspan')
        .attr('x', xScale(previousDate) - 75)
        .attr('dy', 0)
        .text(this.lastOfficeDateLabel)
        .style('cursor', 'pointer')
        .on('click', d => {
          this.getProgessNoteData(previousDate);
        });
    }
    else {
      let rectPrev = nodeSelection.append("rect")
        .attr("x", xScale(previousDate) - 85)
        .attr("y", "20")
        .attr("width", lastOfficewidth)
        .attr("height", lastOfficeheight)
        .attr("fill", "#EBEBEB")
        .attr('stroke', '#BCBCBC')
        .style('cursor', 'pointer')
        .on('click', d => {
          this.getProgessNoteData(previousDate);
        });
      let axisTextPrev = nodeSelection.append('text')
        .attr('y', 35)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('cursor', 'pointer')
      axisTextPrev.append('tspan')
        .attr('x', xScale(previousDate) - 60)
        .attr('dy', 0)
        .text(lastOfficeLabel1)
      axisTextPrev.append('tspan')
        .attr('x', xScale(previousDate) - 75)
        .attr('dy', 15)
        .text(todayLastLabel)
        .on('click', d => {
          this.getProgessNoteData(previousDate);
        })
    }

    nodeSelection.append("line")
      .attr("clip-path", "url(#ref-line-clip)")
      .attr("x1", xScale(today))
      .attr("y1", 15)
      .attr("x2", xScale(today))
      .attr("y2", dimension.offsetHeight - dimension.marginTop - dimension.marginBottom)
      .style("stroke-dasharray", "2,2")
      .style("opacity", "0.4")
      .style("stroke", "#000")
      .style("fill", "none");

    if (today > currentDate) {
      let rect = nodeSelection.append("rect")
        .attr("x", xScale(today) - 50)
        .attr("y", "50")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#EBEBEB")
        .attr('stroke', '#BCBCBC');
      let axisText = nodeSelection.append('text')
        .attr('y', 67)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
      axisText.append('tspan')
        .attr('x', xScale(today) - 42)
        .attr('dy', 0)
        .text(todayLabel)
    }
    else {
      let rect = nodeSelection.append("rect")
        .attr("x", xScale(currentDate) - 85)
        .attr("y", "65")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#EBEBEB")
        .attr('stroke', '#BCBCBC');
      let axisText = nodeSelection.append('text')
        .attr('y', 79)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
      axisText.append('tspan')
        .attr('x', xScale(currentDate) - 68)
        .attr('dy', 0)
        .text(todayLabel1)
      axisText.append('tspan')
        .attr('x', xScale(currentDate) - 72)
        .attr('dy', 17)
        .text(todayLastLabel)
    }
  };


  //#endregion
}


