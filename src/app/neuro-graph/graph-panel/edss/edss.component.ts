import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  TemplateRef,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as d3 from 'd3';
import { BrokerService } from '../../broker/broker.service';
import { NeuroGraphService } from '../../neuro-graph.service';
import { allMessages, allHttpMessages, medication, GRAPH_SETTINGS, edssScoreChart } from '../../neuro-graph.config';

@Component({ selector: '[app-edss]', templateUrl: './edss.component.html', styleUrls: ['./edss.component.scss'], encapsulation: ViewEncapsulation.None })

export class EdssComponent implements OnInit, OnDestroy {
  @Input() chartState: any;
  @ViewChild('edssSecondLevelTemplate') edssSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('edssScoreChartTemplate') edssScoreChartTemplate: TemplateRef<any>;
  subscriptions: any;
  secondLayerDialogRef: MatDialogRef<any>;
  scoreChartDialogRef: MatDialogRef<any>;
  edssChartLoaded: boolean = false;
  virtualCaseloadLoaded: boolean = false;
  edssScoreDetail: any;
  selectedDataPoint: any;
  yScale: any;
  yDomain: Array<number> = [0, GRAPH_SETTINGS.edss.maxValueY];
  clinicianDataSet: Array<any> = [];
  patientDataSet: Array<any> = [];
  edssPopupQuestions: any = [];
  scoreChartOpType: any;
  edssVirtualLoadData: Array<any>;
  edssVirtualLoadDataq1: Array<any>;
  edssVirtualLoadDataq2: Array<any>;
  edssVirtualLoadDataq3: Array<any>;
  edssVirtualLoadDataq4: Array<any>;
  edssVirtualLoadDatam: Array<any>;
  edssVirtualLoadDataLength: number;
  datasetArea1: Array<any> = [];
  datasetArea2: Array<any> = [];
  datasetMean: Array<any> = [];
  edssOpenAddPopUp: boolean = false;
  registerDrag: any;

  constructor(private brokerService: BrokerService, private dialog: MatDialog, private neuroGraphService: NeuroGraphService) {
    this.registerDrag = e => neuroGraphService.registerDrag(e);
  }

  ngOnInit() {
    this.edssPopupQuestions = edssScoreChart;
    this.edssPopupQuestions.map(x => x.checked = false);

    let obsEdss = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'edss'));
    //When EDSS checked
    let sub0 = obsEdss
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error)
          })()
          : (() => {
            this
              .brokerService
              .httpGetMany('FETCH_EDSS_QUES', [
                {
                  urlId: allHttpMessages.httpGetEdss,
                  queryParams: [
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
                  ]
                }, {
                  urlId: allHttpMessages.httpGetAllQuestionnaire,
                  queryParams: [
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
                  ]
                }
              ]);
          })();
      });

    //When EDSS unchecked
    let sub1 = obsEdss
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.unloadChart();
            this.edssChartLoaded = false;
          })();
      });

    //When EDSS add clicked
    let sub2 = this
      .brokerService
      .filterOn(allMessages.invokeAddEdss)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            let dt = d3.selectAll('.edss-charts');
            if (dt["_groups"][0].length == 0) {
              this.edssOpenAddPopUp = true;
              this
                .brokerService
                .emit(allMessages.neuroRelated, {
                  artifact: 'edss',
                  checked: true
                });
            }
            else {
              this.scoreChartOpType = "Add";
              let dialogConfig = {
                hasBackdrop: true,
                panelClass: 'ns-edss-theme',
                width: '670px',
                height: '675px'
              };
              this.scoreChartDialogRef = this
                .dialog
                .open(this.edssScoreChartTemplate, dialogConfig);
              this
                .scoreChartDialogRef
                .updatePosition({ top: '65px', left: '60px' });
            }
          })();
      });

    //When Virtual Caseload clicked
    let sub3 = this
      .brokerService
      .filterOn(allMessages.toggleVirtualCaseload)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            if (d.data.artifact == "add") {
              this
                .brokerService
                .httpGet(allHttpMessages.httpGetVirtualCaseLoad, [
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
            } else {
              this.virtualCaseloadLoaded = false;
              this.removeChart();
              this.drawEdssLineCharts();
            }
          })();
      });

    //When both EDSS and Questionnaire data arrives
    let sub4 = this
      .brokerService
      .filterOn('FETCH_EDSS_QUES')
      .subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error);
            this.brokerService.emit(allMessages.checkboxEnable, 'edss');
          })()
          : (() => {
            let edssData = d.data[0][allHttpMessages.httpGetEdss].edss_scores;
            let quesData = d.data[1][allHttpMessages.httpGetAllQuestionnaire].questionaires;
            //Use moment js later
            let getParsedDate = (dtString) => {
              let dtPart = dtString.split(' ')[0];
              return Date.parse(dtPart);
            }
            if (edssData) {
              this.clinicianDataSet = edssData.map(d => {
                return {
                  ...d,
                  lastUpdatedDate: getParsedDate(d.last_updated_instant),
                  reportedBy: "Clinician",
                  scoreValue: parseFloat(d.score)
                }
              }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);
            }
            if (quesData) {
              this.patientDataSet = quesData.map(d => {
                return {
                  ...d,
                  lastUpdatedDate: getParsedDate(d.qx_completed_at),
                  reportedBy: "Patient",
                  scoreValue: parseFloat(d.edss_score)
                }
              }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);
            }

            if (this.clinicianDataSet && this.patientDataSet) {
              this.drawEdssYAxis();
              this.drawEdssLineCharts();
            }

            this.edssChartLoaded = true;
            if (this.edssOpenAddPopUp == true) {
              this.edssOpenAddPopUp = false;
              let dt = d3.selectAll('.edss-charts');
              if (dt["_groups"][0].length > 0) {
                this.scoreChartOpType = "Add";
                let dialogConfig = {
                  hasBackdrop: true,
                  panelClass: 'ns-edss-theme',
                  width: '670px',
                  height: '675px'
                };
                this.scoreChartDialogRef = this
                  .dialog
                  .open(this.edssScoreChartTemplate, dialogConfig);
                this
                  .scoreChartDialogRef
                  .updatePosition({ top: '65px', left: '60px' });
              }
            }
            this.brokerService.emit(allMessages.checkboxEnable, 'edss');

            //custom error handling
            var ErrorCode: string = '';
            if (!edssData || edssData.length == 0)
              ErrorCode = ErrorCode.indexOf('M-002') != -1 ? ErrorCode : ErrorCode == '' ? 'M-002' : ErrorCode + ',' + 'M-002';
            if (!quesData || quesData.length == 0)
              ErrorCode = ErrorCode.indexOf('M-001') != -1 ? ErrorCode : ErrorCode == '' ? 'M-001' : ErrorCode + ',' + 'M-001';
            if (!quesData || quesData.some(m => m.status.toUpperCase() != "COMPLETED"))
              ErrorCode = ErrorCode.indexOf('U-004') != -1 ? ErrorCode : ErrorCode == '' ? 'U-004' : ErrorCode + ',' + 'U-004';
            if (!quesData || quesData.some(m => m.edss_score == 'No result' || m.edss_score == ''))
              ErrorCode = ErrorCode.indexOf('D-002') != -1 ? ErrorCode : ErrorCode == '' ? 'D-002' : ErrorCode + ',' + 'D-002';
            if (!edssData || edssData.some(m => m.score == 'No result' || m.score == ''))
              ErrorCode = ErrorCode.indexOf('D-002') != -1 ? ErrorCode : ErrorCode == '' ? 'D-002' : ErrorCode + ',' + 'D-002';
            if (ErrorCode != '')
              this.brokerService.emit(allMessages.showCustomError, ErrorCode);
          })();
      });

    //When Virtual Caseload data arrives
    let sub5 = this
      .brokerService
      .filterOn(allHttpMessages.httpGetVirtualCaseLoad)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.edssVirtualLoadData = d.data[0].edss;
            this.edssVirtualLoadDataLength = d.data[0].edss.q1.length;
            this.edssVirtualLoadDataq1 = d.data[0].edss.q1;
            this.edssVirtualLoadDataq2 = d.data[0].edss.q2;
            this.edssVirtualLoadDataq3 = d.data[0].edss.q3;
            this.edssVirtualLoadDataq4 = d.data[0].edss.q4;
            this.edssVirtualLoadDatam = d.data[0].edss.m;
            this.removeChart();
            this.drawVirtualCaseload();
            this.drawEdssLineCharts();
            this.virtualCaseloadLoaded = true;
          })();
      });

    //When zoom option changed
    let sub6 = this
      .brokerService
      .filterOn(allMessages.graphScaleUpdated)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            if (this.edssChartLoaded) {
              if (d.data.fetchData) {
                this.unloadChart();
                this.brokerService.emit(allMessages.neuroRelated, { artifact: 'edss', checked: true });
              }
              else {
                this.reloadChart();
              }
            }
          })();
      })
    //On Add
    let sub7 = this
      .brokerService
      .filterOn(allHttpMessages.httpPostEdss)
      .subscribe(d => {
        d.error ? console.log(d.error) : (() => {
          let currentDate = new Date();
          let selectedScore = d.carryBag.selectedScore;
          this.clinicianDataSet.push({
            last_updated_instant: `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`,
            last_updated_provider_id: this.neuroGraphService.get("queryParams").provider_id,
            save_csn: this.neuroGraphService.get("queryParams").csn,
            save_csn_status: this.neuroGraphService.get("queryParams").csn_status,
            score: selectedScore.score,
            lastUpdatedDate: currentDate.getTime(),
            reportedBy: "Clinician",
            scoreValue: parseFloat(selectedScore.score)
          })
          this.removeChart();
          this.drawEdssLineCharts();
          this.scoreChartDialogRef.close();
        })();
      });

    //On Update
    let sub8 = this
      .brokerService
      .filterOn(allHttpMessages.httpPutEdss)
      .subscribe(d => {
        d.error ? console.log(d.error) : (() => {
          let selectedScore = d.carryBag.selectedScore;
          selectedScore.score = this.edssScoreDetail.score;
          selectedScore.scoreValue = this.edssScoreDetail.scoreValue;
          this.removeChart();
          this.drawEdssLineCharts();
          this.secondLayerDialogRef.close();
        })();
      });

    //Subscription
    this.subscriptions = sub0
      .add(sub1)
      .add(sub2)
      .add(sub3)
      .add(sub4)
      .add(sub5)
      .add(sub6)
      .add(sub7)
      .add(sub8);
  }

  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }

  onSelectChartScore(index) {
    this
      .edssPopupQuestions
      .forEach(q => {
        q.checked = false;
      });
    this.edssPopupQuestions[index].checked = true;
  }

  getPayload(score) {
    let currentDate = new Date();
    let payload = {
      score_id: "1",
      pom_id: this.neuroGraphService.get('queryParams').pom_id.toString(),
      score: score.toString(),
      provider_id: this.neuroGraphService.get("queryParams").provider_id,
      save_csn: this.neuroGraphService.get("queryParams").csn,
      save_csn_status: this.neuroGraphService.get("queryParams").csn_status,
      updated_instant: `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`
    }
    return payload;
  }

  onSubmitChartScore(event) {
    let selectedScore = this
      .edssPopupQuestions
      .find(x => x.checked == true);
    if (!selectedScore) {
      event.stopPropagation()
      return;
    };
    if (this.scoreChartOpType == 'Add') {
      this.brokerService.httpPost(allHttpMessages.httpPostEdss, this.getPayload(selectedScore.score), { selectedScore });
    } else {
      if (this.edssScoreDetail.score !== selectedScore.score) {
        this.edssScoreDetail.score = selectedScore.score;
        this.edssScoreDetail.scoreValue = parseFloat(selectedScore.score);
        this.edssScoreDetail.showUpdate = true
      } else {
        this.edssScoreDetail.showUpdate = false;
      }
      this.showSecondLevel(this.edssScoreDetail);
    }
    this.removeChart();
    this.drawEdssLineCharts();
    this.scoreChartDialogRef.close();
  }

  onClickSecondLayerScore() {
    this.scoreChartOpType = "Update";
    this
      .secondLayerDialogRef
      .close();
    setTimeout(() => {
      let dialogConfig = {
        hasBackdrop: true,
        panelClass: 'ns-edss-theme',
        width: '670px',
        height: '675px'
      };
      this.scoreChartDialogRef = this
        .dialog
        .open(this.edssScoreChartTemplate, dialogConfig);
      this
        .scoreChartDialogRef
        .updatePosition({ top: '65px', left: '60px' });
    }, 500)
  }

  onUpdateSecondLayer() {
    let match = this.clinicianDataSet.find(x => x.save_csn == this.edssScoreDetail.save_csn);
    if (match) {
      let payload = this.getPayload(this.edssScoreDetail.score);
      this.brokerService.httpPut(allHttpMessages.httpPutEdss, this.getPayload(this.edssScoreDetail.score), { selectedScore: match });
    }
  }

  showSecondLevel(data) {
    this.dialog.openDialogs.pop();
    let config = {
      hasBackdrop: true,
      panelClass: 'ns-edss-theme',
      width: '200px'
    };
    this.edssScoreDetail = { ...data };
    this.selectedDataPoint = data;
    this.secondLayerDialogRef = this.dialog.open(this.edssSecondLevelTemplate, config);
    if (d3.event) {
      this.secondLayerDialogRef.updatePosition({ top: `${d3.event.clientY - 150}px`, left: `${d3.event.clientX - 100}px` });
    }
  }

  drawEdssYAxis() {
    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([
        GRAPH_SETTINGS.edss.chartHeight - 20,
        0
      ]);
    let svg = d3
      .select('#edss')
      .append('g')
      .attr('class', 'edss-axis')
      .attr('transform', `translate(${GRAPH_SETTINGS.panel.marginLeft},${GRAPH_SETTINGS.edss.positionTop})`);

    let xAxisGridLines = d3
      .axisLeft(this.yScale)
      .tickSize(0);
    let oneDecimalFormat = d3.format(".1f");

    //Draws Y Axis
    svg
      .append('g')
      .attr('class', 'edss-y-axis')
      .call(g => {
        let yAxis = g.call(d3.axisLeft(this.yScale).tickFormat(oneDecimalFormat));
        g
          .select('.domain')
          .remove();
        yAxis
          .selectAll('line')
          .style('display', 'none');
        yAxis
          .selectAll('text')
          .attr('x', '-5')
          .attr('fill', GRAPH_SETTINGS.edss.color)
          .style('font-size', '1.2em')
          .style('font-weight', 'bold');
      });

    //Axis text
    let axisText = svg
      .append('text')
      .attr('y', GRAPH_SETTINGS.edss.chartHeight)
      .style('font-size', '10px');
    axisText
      .append('tspan')
      .attr('x', -GRAPH_SETTINGS.panel.marginLeft)
      .attr('dy', 0)
      .text('EDSS');
    axisText
      .append('tspan')
      .attr('x', -GRAPH_SETTINGS.panel.marginLeft)
      .attr('dy', 10)
      .text('Score');

    //Grid Lines
    svg
      .append('g')
      .attr('class', 'horizontal-grid-lines')
      .call(g => {
        let axis = g.call(xAxisGridLines);
        axis.selectAll('line')
          .style('stroke', '#f0f0f0');
        axis.selectAll('line')
          .style('stroke-width', '1px')
        axis
          .select('.domain')
          .remove();
        axis
          .selectAll('text')
          .remove();
        axis
          .selectAll('line')
          .attr('x2', (d) => {
            return (this.chartState.canvasDimension.offsetWidth - 45);
          });
      });
  }

  drawEdssLineCharts() {
    let oneDecimalFormat = d3.format(".1f");
    //Chart line
    let line = d3.line<any>().x((d: any) => this.chartState.xScale(d.lastUpdatedDate)).y((d: any) => this.yScale(d.scoreValue));
    //Drawing container
    d3
      .select('#edss')
      .append('clipPath')
      .attr('id', 'edss-clip')
      .append('rect')
      .attr("x", 0)
      .attr("y", -40)
      .attr("width", this.chartState.canvasDimension.width)
      .attr("height", GRAPH_SETTINGS.edss.chartHeight + 40)

    let svg = d3
      .select('#edss')
      .append('g')
      .attr('class', 'edss-charts')
      .attr('transform', `translate(${GRAPH_SETTINGS.panel.marginLeft},${GRAPH_SETTINGS.edss.positionTop})`)
      .attr("clip-path", "url(#edss-clip)");
    //Draws circles for clinician data
    svg
      .selectAll('.dot-clinician')
      .data(this.clinicianDataSet)
      .enter()
      .append('circle')
      .attr('class', 'dot-clinician')
      .attr('cx', d => this.chartState.xScale(d.lastUpdatedDate))
      .attr('cy', d => this.yScale(d.scoreValue))
      .attr('r', 7)
      .style('fill', GRAPH_SETTINGS.edss.color)
      .style('cursor', 'pointer')
      .on('mouseover', d => {
        let match = this
          .patientDataSet
          .find(itm => {
            let cDt = new Date(itm.qx_completed_at);
            let pDt = new Date(d.last_updated_instant);
            return parseFloat(itm.edss_score) == parseFloat(d.score) && pDt.getDate() == cDt.getDate() && pDt.getMonth() == cDt.getMonth() && pDt.getFullYear() == cDt.getFullYear();
          });
        if (match) {
          d.reportedBy = "Patient and Clinician";
        }
        d.allowEdit = d.save_csn_status !== "Closed";
        this.showSecondLevel(d);
      });
    //Adds labels for clinician data
    let labels1 = svg
      .selectAll('.label-clinician')
      .data(this.clinicianDataSet)
      .enter()
      .append('text')
      .attr('class', 'label-clinician')
      .style('font-size', '10px')
      .attr('x', d => this.chartState.xScale(d.lastUpdatedDate) - 7)
      .attr('y', d => this.yScale(d.scoreValue) - 10)
      .text(d => oneDecimalFormat(d.scoreValue));
    //Draws line for patient data
    svg
      .append('path')
      .datum(this.patientDataSet)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', GRAPH_SETTINGS.edss.color)
      .style('stroke-width', '1')
      .attr('d', line);
    //Draws circles for patient data
    svg
      .selectAll('.dot-patient')
      .data(this.patientDataSet)
      .enter()
      .append('circle')
      .attr('class', 'dot-patient')
      .attr('cx', d => this.chartState.xScale(d.lastUpdatedDate))
      .attr('cy', d => this.yScale(d.scoreValue))
      .attr('r', 7)
      .style('fill', GRAPH_SETTINGS.edss.color)
      .style('cursor', 'pointer')
      .on('mouseover', d => {
        this.showSecondLevel(d);
      });
    //Adds labels for patient data
    let labels2 = svg
      .selectAll('.label-patient')
      .data(this.patientDataSet)
      .enter()
      .append('text')
      .attr('class', 'label-patient')
      .style('font-size', '10px')
      .attr('x', d => this.chartState.xScale(d.lastUpdatedDate) - 7)
      .attr('y', d => this.yScale(d.scoreValue) - 10)
      .text(d => oneDecimalFormat(d.scoreValue));
    this.arrangeLabels(labels1, labels2);
  }

  arrangeLabels(labels1, labels2) {
    labels1.each((d1, i, currentNodes) => {
      const current = currentNodes[i];
      let y1 = parseFloat(current.getAttribute('y'));
      const x1 = parseFloat(current.getAttribute('x'));
      const textLength1 = current.textContent.length * 5;
      labels2.each((d2, j, nextNodes) => {
        const next = nextNodes[j];
        if (current !== next) {
          const x2 = parseFloat(next.getAttribute('x'));
          const y2 = parseFloat(next.getAttribute('y'));
          const textLength2 = next.textContent.length * 5;
          if ((Math.abs(x1 - x2) < Math.abs(textLength1)) && (Math.abs(y1) === Math.abs(y2))) {
            next.setAttribute('y', (y2 - 2).toString());
            current.setAttribute('y', (y2 + 28).toString());
            y1 = parseFloat(next.getAttribute('y'));
          }
        }
      });
    });
  }

  drawVirtualCaseload() {
    this.datasetArea1 = [];
    this.datasetArea2 = [];
    this.datasetMean = [];

    let line = d3.line<any>().x((d: any) => this.chartState.xScale(d.lastUpdatedDate)).y((d: any) => this.yScale(d.scoreValue));

    let svg = d3
      .select('#edss')
      .append('g')
      .attr("clip-path", "url(#edss-clip)")
      .attr('class', 'edss-charts')
      .attr('transform', `translate(${GRAPH_SETTINGS.panel.marginLeft},${GRAPH_SETTINGS.edss.positionTop})`);

    this
      .datasetArea1
      .push({ xDate: this.chartState.xDomain.currentMinValue, q2: this.edssVirtualLoadDataq2[0], q3: this.edssVirtualLoadDataq3[0] });

    this
      .datasetArea2
      .push({ xDate: this.chartState.xDomain.currentMinValue, q1: this.edssVirtualLoadDataq1[0], q4: this.edssVirtualLoadDataq4[0] });

    this
      .datasetMean
      .push({ xDate: this.chartState.xDomain.currentMinValue, m: this.edssVirtualLoadDatam[0] });

    for (let i = 0; i < this.edssVirtualLoadDataLength; i++) {
      let scaleMinYear = this.chartState.xDomain.currentMinValue.getFullYear();
      let date = new Date(scaleMinYear, 5, 30).getTime();
      if (i == 1) {
        date = new Date(scaleMinYear + 1, 5, 30).getTime();
      } else if (i == 2) {
        date = new Date(scaleMinYear + 2, 5, 30).getTime();
      }
      this
        .datasetArea1
        .push({ xDate: date, q2: this.edssVirtualLoadDataq2[i], q3: this.edssVirtualLoadDataq3[i] });

      this
        .datasetArea2
        .push({ xDate: date, q1: this.edssVirtualLoadDataq1[i], q4: this.edssVirtualLoadDataq4[i] });

      this
        .datasetMean
        .push({ xDate: date, m: this.edssVirtualLoadDatam[i] });
    }

    this
      .datasetArea1
      .push({
        xDate: this.chartState.xDomain.currentMaxValue,
        q2: this.edssVirtualLoadDataq2[this.edssVirtualLoadDataLength - 1],
        q3: this.edssVirtualLoadDataq3[this.edssVirtualLoadDataLength - 1]
      });

    this
      .datasetArea2
      .push({
        xDate: this.chartState.xDomain.currentMaxValue,
        q1: this.edssVirtualLoadDataq1[this.edssVirtualLoadDataLength - 1],
        q4: this.edssVirtualLoadDataq4[this.edssVirtualLoadDataLength - 1]
      });

    this
      .datasetMean
      .push({
        xDate: this.chartState.xDomain.currentMaxValue,
        m: this.edssVirtualLoadDatam[this.edssVirtualLoadDataLength - 1]
      });

    let lineMean = d3.line<any>().x((d: any) => this.chartState.xScale(d.xDate)).y((d: any) => this.yScale(d.m));

    let area1 = d3
      .area()
      .x((d: any) => this.chartState.xScale(d.xDate))
      .y0((d: any) => this.yScale(d.q2))
      .y1((d: any) => this.yScale(d.q3));

    let area2 = d3
      .area()
      .x((d: any) => this.chartState.xScale(d.xDate))
      .y0((d: any) => this.yScale(d.q1))
      .y1((d: any) => this.yScale(d.q4));

    svg
      .append("path")
      .datum(this.datasetArea2)
      .attr("fill", "lightgrey")
      .attr("d", area2);

    svg
      .append("path")
      .datum(this.datasetArea1)
      .attr("fill", "darkgrey")
      .attr("d", area1);

    svg
      .append('path')
      .datum(this.datasetMean)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', "white")
      .style('stroke-width', '1')
      .attr('d', lineMean);
  }

  removeChart() {
    d3
      .selectAll('.edss-charts')
      .remove();
  }

  unloadChart() {
    d3
      .select('#edss')
      .selectAll("*")
      .remove();
  }

  reloadChart() {
    if (this.edssChartLoaded) {
      this.unloadChart();
      this.drawEdssYAxis();
      if (this.virtualCaseloadLoaded) {
        this.drawVirtualCaseload();
      }
      this.drawEdssLineCharts();
    }
  }
}