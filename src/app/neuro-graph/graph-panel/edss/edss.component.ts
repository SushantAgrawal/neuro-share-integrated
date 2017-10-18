import { Component, OnInit, Input, ViewChild, TemplateRef, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as d3 from 'd3';
import { BrokerService } from '../../broker/broker.service';
import { NeuroGraphService } from '../../neuro-graph.service';
import { allMessages, allHttpMessages, medication, GRAPH_SETTINGS, edssScoreChart } from '../../neuro-graph.config';

@Component({
  selector: '[app-edss]',
  templateUrl: './edss.component.html',
  styleUrls: ['./edss.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class EdssComponent implements OnInit {

  //#region Private Fields
  @Input() private chartState: any;
  @ViewChild('edssSecondLevelTemplate') private edssSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('edssScoreChartTemplate') private edssScoreChartTemplate: TemplateRef<any>;
  private subscriptions: any;
  private secondLayerDialogRef: MatDialogRef<any>;
  private scoreChartDialogRef: MatDialogRef<any>;
  private edssScoreDetail: any;
  private yScale: any;
  private yDomain: Array<number> = [0, GRAPH_SETTINGS.edss.maxValueY];
  private edssData: Array<any>;
  private edssPopupQuestions: any = [];
  private scoreChartOpType: any;
  private edssVirtualLoadData: Array<any>;
  private edssVirtualLoadDataq1: Array<any>;
  private edssVirtualLoadDataq2: Array<any>;
  private edssVirtualLoadDataq3: Array<any>;
  private edssVirtualLoadDataq4: Array<any>;
  private edssVirtualLoadDatam: Array<any>;
  private edssVirtualLoadDataLength: number;
  private datasetArea1: Array<any> = [];
  private datasetArea2: Array<any> = [];
  private datasetMean: Array<any> = [];
  private questionnaireEdssData: Array<any> = [];
  //#endregion

  //#region Constructor
  constructor(
    private brokerService: BrokerService,
    private dialog: MatDialog,
    private neuroGraphService: NeuroGraphService
  ) { }
  //#endregion

  //#region Lifecycle Event Handlers
  ngOnInit() {
    this.edssPopupQuestions = edssScoreChart;
    this.edssPopupQuestions.map(x => x.checked = false);

    let obsEdss = this.brokerService.filterOn(allMessages.neuroRelated).filter(t => (t.data.artifact == 'edss'));
    //When EDSS checked
    let sub0 = obsEdss.filter(t => t.data.checked).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.brokerService.httpGet(allHttpMessages.httpGetEdss);
        this.brokerService.httpGet(allHttpMessages.httpGetAllQuestionnaire);
      })();
    });

    //When EDSS unchecked
    let sub1 = obsEdss.filter(t => !t.data.checked).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.unloadChart();
      })();
    })

    //When EDSS add clicked
    let sub2 = this.brokerService.filterOn(allMessages.invokeAddEdss).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.scoreChartOpType = "Add";
        let dialogConfig = { hasBackdrop: true, panelClass: 'ns-edss-theme', width: '670px', height: '650px' };
        this.scoreChartDialogRef = this.dialog.open(this.edssScoreChartTemplate, dialogConfig);
        this.scoreChartDialogRef.updatePosition({ top: '55px', left: '55px' });
      })();
    })

    //When Virtual Caseload clicked
    let sub3 = this.brokerService.filterOn(allMessages.virtualCaseload).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        if (d.data.artifact == "add") {
          this.brokerService.httpGet(allHttpMessages.httpGetVirtualCaseLoad);
        }
        else {
          this.removeChart();
          this.drawEdssLineCharts();
        }
      })();
    })

    //When EDSS data arrives
    let sub4 = this.brokerService.filterOn(allHttpMessages.httpGetEdss)
      .subscribe(d => {
        d.error ? console.log(d.error) : (() => {
          this.edssData = d.data.edss_scores;
          this.drawEdssYAxis();
          this.drawEdssLineCharts();
        })();
      })


    //When Virtual Caseload data arrives
    let sub5 = this.brokerService.filterOn(allHttpMessages.httpGetVirtualCaseLoad)
      .subscribe(d => {
        d.error ? console.log(d.error) : (() => {
          this.edssVirtualLoadData = d.data[0].edss;
          this.edssVirtualLoadDataLength = d.data[0].edss.q1.length;
          this.edssVirtualLoadDataq1 = d.data[0].edss.q1;
          this.edssVirtualLoadDataq2 = d.data[0].edss.q2;
          this.edssVirtualLoadDataq3 = d.data[0].edss.q3;
          this.edssVirtualLoadDataq4 = d.data[0].edss.q4;
          this.edssVirtualLoadDatam = d.data[0].edss.m;
          this.removeChart();
          this.drawVirtualCaseload();
        })();
      })


    //When Questiionnaire data arrives
    let sub6 = this.brokerService.filterOn(allHttpMessages.httpGetAllQuestionnaire)
      .subscribe(d => {
        d.error ? console.log(d.error) : (() => {
          this.questionnaireEdssData = d.data.questionaires;
          this.removeChart();
          this.drawEdssLineCharts();
        })();
      })


    //Subscription
    this.subscriptions = sub0
      .add(sub1)
      .add(sub2)
      .add(sub3)
      .add(sub4)
      .add(sub5)
      .add(sub6);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  //#endregion

  //#region UI Event Handlers
  onSelectChartScore(index) {
    this.edssPopupQuestions.forEach(q => {
      q.checked = false;
    });
    this.edssPopupQuestions[index].checked = true;
  }

  onSubmitChartScore(event) {
    let selectedScore = this.edssPopupQuestions.find(x => x.checked == true);
    if (!selectedScore) {
      event.stopPropagation()
      return;
    };
    if (this.scoreChartOpType == 'Add') {
      //Call api and update local data on success
      let currentDate = new Date();
      this.edssData.push({
        last_updated_instant: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
        last_updated_provider_id: "G00123",
        save_csn: this.neuroGraphService.get("queryParams").csn,
        save_csn_status: this.neuroGraphService.get("queryParams").encounter_status,
        score: selectedScore.score,
      })
    }
    else {
      if (this.edssScoreDetail.score !== selectedScore.score) {
        this.edssScoreDetail.score = selectedScore.score;
        this.edssScoreDetail.scoreValue = parseFloat(selectedScore.score);
        this.edssScoreDetail.showUpdate = true
      }
      else {
        this.edssScoreDetail.showUpdate = false;
      }
      this.showSecondLevel(this.edssScoreDetail);
      //Call Update API
    }
    this.removeChart();
    this.drawEdssLineCharts();
    this.scoreChartDialogRef.close();
  }

  onClickSecondLayerScore() {
    this.scoreChartOpType = "Update";
    this.secondLayerDialogRef.close();
    setTimeout(() => {
      let dialogConfig = { hasBackdrop: true, panelClass: 'ns-edss-theme', width: '670px', height: '650px' };
      this.scoreChartDialogRef = this.dialog.open(this.edssScoreChartTemplate, dialogConfig);
      this.scoreChartDialogRef.updatePosition({ top: '55px', left: '55px' });
    }, 500)
  }

  onUpdateSecondLayer() {
    let match = this.edssData.find(x => x.score_id == this.edssScoreDetail.score_id);
    if (match) {
      match.score = this.edssScoreDetail.score
    }
    this.removeChart();
    this.drawEdssLineCharts();
    this.secondLayerDialogRef.close();
  }

  //#endregion

  //#region Misc
  showSecondLevel(data) {
    let config = { hasBackdrop: true, panelClass: 'ns-edss-theme', width: '200px' };
    this.edssScoreDetail = data;
    this.secondLayerDialogRef = this.dialog.open(this.edssSecondLevelTemplate, config);
  }
  //#endregion

  //#region Chart Drawing Related
  drawEdssYAxis() {
    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([GRAPH_SETTINGS.edss.chartHeight - 20, 0]);
    let svg = d3
      .select('#edss')
      .append('g')
      .attr('class', 'edss-axis')
      .attr('transform', `translate(${GRAPH_SETTINGS.panel.marginLeft},${GRAPH_SETTINGS.edss.positionTop})`);

    let xAxisGridLines = d3.axisLeft(this.yScale).tickSize(0);
    let oneDecimalFormat = d3.format(".1f");

    //Draws Y Axis
    svg.append('g')
      .attr('class', 'edss-y-axis')
      .call(g => {
        let yAxis = g.call(d3.axisLeft(this.yScale).tickFormat(oneDecimalFormat));
        g.select('.domain').remove();
        yAxis.selectAll('line')
          .style('display', 'none');
        yAxis.selectAll('text')
          .attr('x', '-5')
          .attr('fill', GRAPH_SETTINGS.edss.color)
          .style('font-size', '1.2em')
          .style('font-weight', 'bold');
      });

    //Axis text
    let axisText = svg.append('text')
      .attr('y', GRAPH_SETTINGS.edss.chartHeight)
      .style('font-size', '10px');
    axisText.append('tspan')
      .attr('x', -GRAPH_SETTINGS.panel.marginLeft)
      .attr('dy', 0)
      .text('EDSS')
    axisText.append('tspan')
      .attr('x', -GRAPH_SETTINGS.panel.marginLeft)
      .attr('dy', 10)
      .text('Score')

    //Grid Lines
    svg.append('g')
      .attr('class', 'horizontal-grid-lines')
      .call(g => {
        let axis = g.call(xAxisGridLines)
        axis.select('.domain').remove();
        axis.selectAll('text').remove();
        axis.selectAll('line').attr('x2', (d) => {
          return this.chartState.canvasDimension.offsetWidth;
        });
      });
  }

  drawEdssLineCharts() {
    //Use moment js later
    let getParsedDate = (dtString) => {
      let dtPart = dtString.split(' ')[0];
      return Date.parse(dtPart);
    }

    let clinicianDataSet = this.edssData.map(d => {
      return {
        ...d,
        lastUpdatedDate: getParsedDate(d.last_updated_instant),
        reportedBy: "Clinician",
        scoreValue: parseFloat(d.score)
      }
    }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);

    let patientDataSet = this.questionnaireEdssData.map(d => {
      return {
        ...d,
        lastUpdatedDate: getParsedDate(d.qx_completed_at),
        reportedBy: "Patient",
        scoreValue: parseFloat(d.edss_score)
      }
    }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);

    let oneDecimalFormat = d3.format(".1f");

    //Chart line
    let line = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.lastUpdatedDate))
      .y((d: any) => this.yScale(d.scoreValue));
    //Drawing container
    let svg = d3
      .select('#edss')
      .append('g')
      .attr('class', 'edss-charts')
      .attr('transform', `translate(${GRAPH_SETTINGS.panel.marginLeft},${GRAPH_SETTINGS.edss.positionTop})`)

    //Draws circles for clinician data
    svg.selectAll('.dot-clinician')
      .data(clinicianDataSet)
      .enter()
      .append('circle')
      .attr('class', 'dot-clinician')
      .attr('cx', d => this.chartState.xScale(d.lastUpdatedDate))
      .attr('cy', d => this.yScale(d.scoreValue))
      .attr('r', 7)
      .style('fill', GRAPH_SETTINGS.edss.color)
      .style('cursor', 'pointer')
      .on('click', d => {
        let match = this.questionnaireEdssData.find(itm => {
          let cDt = new Date(itm.qx_completed_at);
          let pDt = new Date(d.last_updated_instant);
          return parseFloat(itm.edss_score) == parseFloat(d.score) && pDt.getDate() == cDt.getDate() && pDt.getMonth() == cDt.getMonth() && pDt.getFullYear() == cDt.getFullYear();
        });
        if (match) {
          d.reportedBy = "Patient and Clinician";
        }
        d.allowEdit = d.save_csn_status !== "Closed";
        this.showSecondLevel(d);
      })
    //Adds labels for clinician data
    svg.selectAll('.label-clinician')
      .data(clinicianDataSet)
      .enter()
      .append('text')
      .attr('class', 'label-clinician')
      .style('font-size', '10px')
      .attr('x', d => this.chartState.xScale(d.lastUpdatedDate) - 7)
      .attr('y', d => this.yScale(d.scoreValue) - 10)
      .text(d => oneDecimalFormat(d.scoreValue));
    //Draws line for patient data 
    svg.append('path')
      .datum(patientDataSet)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', GRAPH_SETTINGS.edss.color)
      .style('stroke-width', '1')
      .attr('d', line);
    //Draws circles for patient data
    svg.selectAll('.dot-patient')
      .data(patientDataSet)
      .enter()
      .append('circle')
      .attr('class', 'dot-patient')
      .attr('cx', d => this.chartState.xScale(d.lastUpdatedDate))
      .attr('cy', d => this.yScale(d.scoreValue))
      .attr('r', 7)
      .style('fill', GRAPH_SETTINGS.edss.color)
      .style('cursor', 'pointer')
      .on('click', d => {
        this.showSecondLevel(d);
      })
    //Adds labels for patient data
    svg.selectAll('.label-patient')
      .data(patientDataSet)
      .enter()
      .append('text')
      .attr('class', 'label-patient')
      .style('font-size', '10px')
      .attr('x', d => this.chartState.xScale(d.lastUpdatedDate) - 7)
      .attr('y', d => this.yScale(d.scoreValue) - 10)
      .text(d => oneDecimalFormat(d.scoreValue));
  }

  drawVirtualCaseload() {
    let line = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.lastUpdatedDate))
      .y((d: any) => this.yScale(d.scoreValue));

    let svg = d3
      .select('#edss')
      .append('g')
      .attr('class', 'edss-charts')
      .attr('transform', `translate(${GRAPH_SETTINGS.panel.marginLeft},${GRAPH_SETTINGS.edss.positionTop})`)

    this.datasetArea1.push({
      "xDate": Date.parse("01/01/2015"),
      "q2": this.edssVirtualLoadDataq2[0],
      "q3": this.edssVirtualLoadDataq3[0]
    });

    this.datasetArea2.push({
      "xDate": Date.parse("01/01/2015"),
      "q1": this.edssVirtualLoadDataq1[0],
      "q4": this.edssVirtualLoadDataq4[0]
    });

    this.datasetMean.push({
      "xDate": Date.parse("01/01/2015"),
      "m": this.edssVirtualLoadDatam[0]
    });

    for (let i = 0; i < this.edssVirtualLoadDataLength; i++) {
      let date = Date.parse("06/30/2015");
      if (i == 1) {
        date = Date.parse("06/30/2016");
      }
      else if (i == 2) {
        date = Date.parse("06/30/2017");
      }
      this.datasetArea1.push({
        "xDate": date,
        "q2": this.edssVirtualLoadDataq2[i],
        "q3": this.edssVirtualLoadDataq3[i]
      });

      this.datasetArea2.push({
        "xDate": date,
        "q1": this.edssVirtualLoadDataq1[i],
        "q4": this.edssVirtualLoadDataq4[i]
      });

      this.datasetMean.push({
        "xDate": date,
        "m": this.edssVirtualLoadDatam[i]
      });
    }

    this.datasetArea1.push({
      "xDate": Date.parse("12/31/2017"),
      "q2": this.edssVirtualLoadDataq2[this.edssVirtualLoadDataLength - 1],
      "q3": this.edssVirtualLoadDataq3[this.edssVirtualLoadDataLength - 1]
    });

    this.datasetArea2.push({
      "xDate": Date.parse("12/31/2017"),
      "q1": this.edssVirtualLoadDataq1[this.edssVirtualLoadDataLength - 1],
      "q4": this.edssVirtualLoadDataq4[this.edssVirtualLoadDataLength - 1]
    });

    this.datasetMean.push({
      "xDate": Date.parse("12/31/2017"),
      "m": this.edssVirtualLoadDatam[this.edssVirtualLoadDataLength - 1]
    });

    let lineMean = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.xDate))
      .y((d: any) => this.yScale(d.m));

    let area1 = d3.area()
      .x((d: any) => this.chartState.xScale(d.xDate))
      .y0((d: any) => this.yScale(d.q2))
      .y1((d: any) => this.yScale(d.q3));

    let area2 = d3.area()
      .x((d: any) => this.chartState.xScale(d.xDate))
      .y0((d: any) => this.yScale(d.q1))
      .y1((d: any) => this.yScale(d.q4));

    svg.append("path")
      .datum(this.datasetArea2)
      .attr("fill", "lightgrey")
      .attr("d", area2);

    svg.append("path")
      .datum(this.datasetArea1)
      .attr("fill", "darkgrey")
      .attr("d", area1);

    svg.append('path')
      .datum(this.datasetMean)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', "white")
      .style('stroke-width', '1')
      .attr('d', lineMean);

    this.drawEdssLineCharts();
  }

  removeChart() {
    d3.selectAll('.edss-charts').remove();
  }

  unloadChart() {
    d3.select('#edss').selectAll("*").remove();
  }
  //#endregion
}
