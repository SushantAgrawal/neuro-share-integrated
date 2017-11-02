import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { NeuroGraphService } from '../../neuro-graph.service';
import 'innersvg-polyfill';
@Component({
  selector: '[app-symptoms]',
  templateUrl: './symptoms.component.html',
  styleUrls: ['./symptoms.component.scss']
})
export class SymptomsComponent implements OnInit {
  @ViewChild('symptomSecondLevelTemplate') private symptomSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('symptomsThirdLevelTemplate') private symptomsThirdLevelTemplate: TemplateRef<any>;
  @Input() private chartState: any;
  private yDomain: Array<number> = [0, 1];
  private width: number;
  private height: number;
  private yScale: any;
  private month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private symptomsDetail: any;
  private subscriptions: any;
  private pathUpdate: any;
  private line: any;
  private chart: any;
  private paramData: any;
  private datasetB: Array<any>;
  private dialogRef: any;
  private questDialogRef: any;
  private symptomsData: any;
  private symptomsDataDetails: Array<any>;
  private questionaireData: Array<any>;
  private questionaireSymptomData: Array<any> = [];
  private symptomsChartLoaded: boolean = false;
  constructor(private brokerService: BrokerService, public dialog: MdDialog, private neuroGraphService: NeuroGraphService) {
    this.paramData = this.neuroGraphService.get('queryParams')
  }
  ngOnInit() {

    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetSymptoms)
      .subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error)
          })
          : (() => {
            //debugger;
            //this.questionaireData = d.data.questionaires.sort((a:any, b:any) => new Date(a["qx_completed_at"]) - b["qx_completed_at"]);
            this.questionaireData = d.data.questionaires.map(d => {
              return {
                ...d,
                qxCompleted: new Date(this.neuroGraphService.moment(d["qx_completed_at"]).format("MM/DD/YYYY")),
              }
            }).sort((a, b) => b.qxCompleted - a.qxCompleted)

            //let element = this.questionaireData[0];
            this.questionaireData.forEach(element => {
              //debugger;
              let symptomsDataLocal: Array<any> = [];

              for (let i = 0; i < element.symptoms.length; i++) {
                let symptomStatus: any = "";
                let reportedDate: any;
                let qData: Array<any> = [];
                reportedDate = element["qx_completed_at"];
                qData.push(element.responses.filter(item => element.symptoms[i].qx_code.some(f => f == item["qx_code"])));
                let prevCnt = 0;
                let newCnt = this.questionaireData.length - 2;
                let trend: Array<any> = [];
                let answerOptions: Array<any> = [];
                let answerText: any = "";
                let questionText: any = "";
                //let reportDate:any;
                let cnt = 40;
                this.questionaireData.forEach(elem => {
                 // debugger;
                  if (element["qx_id"] != elem["qx_id"] && new Date(this.neuroGraphService.moment(elem["qx_completed_at"]).format("MM/DD/YYYY")) < new Date(this.neuroGraphService.moment(element["qx_completed_at"]).format("MM/DD/YYYY"))) {
                    if (element.symptoms[i].score != "") {
                      if(new Date(this.neuroGraphService.moment(reportedDate).format("MM/DD/YYYY")) >= new Date(this.neuroGraphService.moment(element["qx_completed_at"]).format("MM/DD/YYYY")))
                      reportedDate = element["qx_completed_at"];
                      if (elem.symptoms[i].score == "") {
                        newCnt--;
                      }
                    }
                    else {
                      if (elem.symptoms[i].score != "" &&  element.symptoms[i].score=="") {
                        prevCnt++;
                        reportedDate = elem["qx_completed_at"];
                        element.symptoms[i].score = elem.symptoms[i].score;
                        qData = [];
                        qData.push(elem.responses.filter(item => elem.symptoms[i].qx_code.some(f => f == item["qx_code"])));

                      }
                    }
                    if (cnt >=20) {
                      if (elem.symptoms[i].score == "Mild") {
                        trend.push({
                          index: 10,
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt - 20;
                      }
                      else if (elem.symptoms[i].score == "Moderate") {
                        trend.push({
                          index: 20,
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt - 20;
                      }
                      else if (elem.symptoms[i].score == "Severe") {
                        trend.push({
                          index: 30,
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt - 20;
                      }
                      else if (elem.symptoms[i].score != "") {
                        trend.push({
                          index: Number(elem.symptoms[i].score),
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt - 20;
                      }
                    }

                  }

                });
                trend.reverse();
                if (prevCnt <= 0) {
                  if (element.symptoms[i].score == "Mild") {
                    trend.push({
                      index: 10,
                      x: 60,
                      score: element.symptoms[i].score

                    });
                  }
                  else if (element.symptoms[i].score == "Moderate") {
                    trend.push({
                      index: 20,
                      x: 60,
                      score: element.symptoms[i].score

                    });
                  }
                  else if (element.symptoms[i].score == "Severe") {
                    trend.push({
                      index: 30,
                      x: 60,
                      score: element.symptoms[i].score

                    });
                  }
                  else if (element.symptoms[i].score != "") {
                    trend.push({
                      index: Number(element.symptoms[i].score),
                      x: 60,
                      score: element.symptoms[i].score

                    });
                  }
                }

                if (newCnt == 0) {
                  symptomStatus = "New";
                  trend = [];

                }
                if (prevCnt > 0) {
                  symptomStatus = "Previous";
                }
                let trendScore=0;
                if(Number(element.symptoms[i].score))
                {
                  trendScore = (Number(element.symptoms[i].score))*10;
                }
                else{
                  trendScore = element.symptoms[i].score;
                }
                var data = {
                  name: element.symptoms[i].title,
                  nameTrend: element.symptoms[i].title.split(' ').join('_'),
                  score: element.symptoms[i].score,
                  trendScore:trendScore,
                  qx_code: element.symptoms[i].qx_code,
                  symptomStatus: symptomStatus,
                  reportDate: this.neuroGraphService.moment(reportedDate).format("MM/DD/YYYY"),
                  trends: trend,
                  questData: qData,
                  qxid: element["qx_id"]
                };
                symptomsDataLocal.push(data)
              }
              this.questionaireSymptomData.push({
                questionnaireDate: this.neuroGraphService.moment(element["qx_completed_at"]).format("MM/DD/YYYY"),
                status: (element.status.charAt(0).toUpperCase() + element.status.substr(1).toLowerCase()),
                "qx_id": element["qx_id"],
                symptoms: symptomsDataLocal

              });
              //d.data.questionaires.forEach(element => { 

            });
            //debugger;            
            this.createChartSymptoms();
            this.symptomsChartLoaded = true;
          })();
      })
    let symptoms = this
      .brokerService
      .filterOn(allMessages.neuroRelated)
      .filter(t => (t.data.artifact == 'symptoms'));

    let sub1 = symptoms
      .filter(t => t.data.checked)
      .subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error)
          })
          : (() => {
            //debugger;
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetSymptoms, [
                {
                  name: 'pom_id',
                  value: this.neuroGraphService.get('queryParams').pom_id
                }
              ]);
          })();
      });
    let sub2 = symptoms
      .filter(t => !t.data.checked)
      .subscribe(d => {
        d.error
          ? console.log(d.error)
          : (() => {
            this.removeChartSymptoms();
            this.symptomsChartLoaded = false;
          })();
      })

      //When zoom option changed
    let sub4 = this
    .brokerService
    .filterOn(allMessages.graphScaleUpdated)
    .subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          if (this.symptomsChartLoaded) {
            if (d.data.fetchData) {
              this.removeChartSymptoms();
              this.brokerService.emit(allMessages.neuroRelated, { artifact: 'symptoms', checked: true });
            }
            else {
              this.removeChartSymptoms();
              this.createChartSymptoms();
            }
          }
        })();
    })


    this
      .subscriptions
      .add(sub1)
      .add(sub2)
      .add(sub4)
  }

  ngOnDestroy() {
    this
      .subscriptions
      .unsubscribe();
  }

  removeChartSymptoms() {
    d3.select('#symptoms').selectAll("*").remove();
  }

  showSecondLevel(data) {
    //debugger;
    this.symptomsData = data;
    let dialogConfig = { hasBackdrop: false, panelClass: 'ns-symptoms-theme', width: '750px' };
    this.dialogRef = this.dialog.open(this.symptomSecondLevelTemplate, dialogConfig);
    this.dialogRef.afterOpen().subscribe((ref: MdDialogRef<any>) => {
      this.plottrendlineSymptoms();
    });
  }
  plottrendlineSymptoms() {
    //debugger;
    if (this.symptomsData.symptoms.length > 0) {
      this.symptomsData.symptoms.forEach(elems => {
        if (elems.trends.length > 1)
          this.drawtrendLineSymptoms(elems.qxid, elems.trendScore, elems.nameTrend, elems.trends)
      });
    }

  }
  drawtrendLineSymptoms(qid, scoreid, compName, trendData) {
    //debugger; 
    let maxValue = Math.max.apply(Math, trendData.map(function (o) { return o.index; }));
    let minValue = Math.min.apply(Math, trendData.map(function (o) { return o.index; }))
   
    let scale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([25, 15]);
    //Chart line
    let line = d3.line<any>()
      .x((d: any) => d.x)
      .y((d: any) => scale(d.index))

    //Drawing container

    let svg = d3
      .select('#TrendLine_' + qid + '_' + scoreid + '_' + compName)
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
      .attr('cy', d => scale(d.index))
      .attr('r', 4)
      .style("fill", d => {
        return "#bfbfbf";
      })
      .style('cursor', 'pointer')
      .append("svg:title") // TITLE APPENDED HERE
      .text(function (d) { return d.score; })


  }
  showThirdLayer(dataDet) {
    this.symptomsDataDetails = dataDet;
    this.dialog.openDialogs.pop();
    let dialogConfig = { hasBackdrop: false, skipHide: true, panelClass: 'ns-symptoms-theme', width: '350px', height: '350px' };
    this.questDialogRef = this.dialog.open(this.symptomsThirdLevelTemplate, dialogConfig);
    //this.questDialogRef.updatePosition({ top: '50px', left: "860px" });
  }

  createChartSymptoms() {
    //debugger;
    this.datasetB = this.questionaireSymptomData.map(d => {
      // let relMonth = this.month.indexOf(d.relapse_month);
      //  let relYear = parseInt(d.relapse_year);
      return {
        ...d,
        questionnaireDate_mod: new Date(this.neuroGraphService.moment(d.questionnaireDate).format("MM/DD/YYYY")),
        // last_updated_instant: d.relapse_month + "/15/" + d.relapse_year,
        // lastUpdatedDate: new Date(relYear, relMonth, 15),
        // confirm: d.clinician_confirmed,
        // month: d.relapse_month,
        // year: d.relapse_year
      }
    }).sort((a, b) => a.questionnaireDate_mod - b.questionnaireDate_mod);

    let element = d3.select("#symptoms");
    this.width = GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight;
    this.height = GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom;

    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([GRAPH_SETTINGS.symptoms.chartHeight - 20, 0]);

    this.line = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.questionnaireDate_mod))
      .y((d: any) => 0);

    this.chart = d3.select("#symptoms")
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.symptoms.positionTop + ")");

    this.pathUpdate = this.chart.append("path")
      .datum([
        { "questionnaireDate_mod": this.chartState.xDomain.currentMinValue },
        { "questionnaireDate_mod": this.chartState.xDomain.currentMaxValue }
      ])
      .attr("class", "line")
      .attr("d", this.line)
      .attr("stroke", GRAPH_SETTINGS.symptoms.color)
      .attr("stroke-width", "1.5")
      .attr("fill", "none");
//let svgImage1= '<span class="icon-symptoms" width="30" height="30" style="background-color: #EA700D; border-radius: 5px; padding: 2px; color: #ffffff; font-size: 20px; width: 20px; height: 21px; display: block;"></span>';

    let svgImage='<g> <g> <path style="fill-rule:evenodd;clip-rule:evenodd;fill:#EA700D;" d="M10.2,32.4h20.2c1.4,0,2.5-1.1,2.5-2.5V11.1c0-1.4-1.1-2.5-2.5-2.5H10.2c-1.4,0-2.5,1.1-2.5,2.5v18.7 C7.7,31.2,8.8,32.4,10.2,32.4L10.2,32.4z"/> <g class="st1"> <path style="fill:none;stroke:#EA700D;stroke-width:1.7638;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M10.2,32.4h20.2c1.4,0,2.5-1.1,2.5-2.5V11.1c0-1.4-1.1-2.5-2.5-2.5H10.2c-1.4,0-2.5,1.1-2.5,2.5v18.7 C7.7,31.2,8.8,32.4,10.2,32.4L10.2,32.4z"/> <g class="st3"> <g class="st4"> <g class="st5"> <path style="fill:#FFFFFF;" d="M17.2,30.5c-0.7-0.3-1-0.9-1-1.7c0.1-1.8,0-3.6,0-5.4c0-0.2,0-0.3,0-0.5c0.8,0.6,1.7,1.1,2.6,1.8 c0,1.4,0,3,0,4.5c0,0.6-0.4,0.9-0.9,1.2C17.7,30.5,17.5,30.5,17.2,30.5L17.2,30.5z"/> <path style="fill:#FFFFFF;" d="M20.9,30.5c-0.7-0.4-0.9-1-0.9-1.8c0.1-1.3,0-2.5,0-3.8c0.9-0.1,1.7-0.2,2.6-0.3c0,0.8,0,1.7,0,2.6 c0,0.5,0,1.1,0,1.6c0.1,0.8-0.2,1.4-1,1.7C21.4,30.5,21.1,30.5,20.9,30.5L20.9,30.5z"/> <path style="fill:#FFFFFF;" d="M19.9,9.6c0.6,0.2,1.2,0.6,1.4,1.3c0.4,1-0.1,2.1-1.1,2.5c-1,0.4-2.1-0.1-2.5-1c-0.4-1,0-2.1,0.9-2.5 c0.1-0.1,0.3-0.1,0.4-0.2C19.3,9.6,19.6,9.6,19.9,9.6L19.9,9.6z"/> <path style="fill:#FFFFFF;" d="M25,21.6c1.5,1.5,3,3,4.4,4.4c0.5,0.5,0.4,1.3-0.1,1.8c-0.5,0.5-1.3,0.5-1.8,0.1c-1.5-1.4-3-2.9-4.4-4.4 c-2.7,1.4-5.3,0.2-6.5-1.5c-1.3-1.9-1.1-4.5,0.6-6.2c1.6-1.7,4.3-1.9,6.2-0.6C25.1,16.2,26.4,18.7,25,21.6L25,21.6z M24.5,19.1c0-2.1-1.7-3.8-3.8-3.8c-2.1,0-3.8,1.7-3.8,3.8c0,2.1,1.7,3.8,3.8,3.8S24.5,21.3,24.5,19.1L24.5,19.1z"/> <path style="fill:#FFFFFF;" d="M17.4,14.4c-0.5,0.7-1.1,1.4-1.7,2c-0.1,0.1-0.3,0.2-0.4,0.2c-1.1,0-2.2,0-3.2,0c-0.8,0-1.2-0.5-1.2-1.2 c0-0.6,0.5-1,1.2-1c1.7,0,3.3,0,5,0C17.2,14.4,17.3,14.4,17.4,14.4L17.4,14.4z"/> <path style="fill:#FFFFFF;" d="M24,14.4c1,0,2.1,0,3.2,0c0.5,0,0.9,0.5,0.9,1c0,0.5-0.3,1-0.8,1.1c-0.5,0.1-0.9,0.1-1.4,0.1 c-0.1,0-0.2-0.1-0.3-0.2C25.1,15.7,24.5,15,24,14.4L24,14.4z"/> <path style="fill:#FFFFFF;" d="M22.6,19.2c0,0.7,0,1.3,0,2c0,0.2-0.1,0.5-0.3,0.6c-1.2,0.8-2.9,0.5-3.9-0.5c-1-1.2-1-2.9-0.1-4 c1-1.1,2.6-1.4,3.9-0.7c0.3,0.2,0.4,0.3,0.4,0.7C22.6,17.9,22.6,18.5,22.6,19.2L22.6,19.2z"/> </g> </g> </g> </g> </g> </g>';
    //let svgImage='<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"> <style type="text/css"> .st0{clip-path:url(#SVGID_2_);fill-rule:evenodd;clip-rule:evenodd;fill:#EA700D;} .st1{clip-path:url(#SVGID_2_);} .st2{clip-path:url(#SVGID_4_);fill:none;stroke:#EA700D;stroke-width:1.7638;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} .st3{clip-path:url(#SVGID_4_);} .st4{clip-path:url(#SVGID_6_);} .st5{clip-path:url(#SVGID_8_);} .st6{clip-path:url(#SVGID_10_);fill:#FFFFFF;} </style> <g> <g> <defs> <polygon id="SVGID_1_" points="5.1,34.3 34.5,34.3 34.5,6 5.1,6 5.1,34.3 "/> </defs> <clipPath id="SVGID_2_"> <use xlink:href="#SVGID_1_" style="overflow:visible;"/> </clipPath> <path class="st0" d="M10.2,32.4h20.2c1.4,0,2.5-1.1,2.5-2.5V11.1c0-1.4-1.1-2.5-2.5-2.5H10.2c-1.4,0-2.5,1.1-2.5,2.5v18.7 C7.7,31.2,8.8,32.4,10.2,32.4L10.2,32.4z"/> <g class="st1"> <defs> <polygon id="SVGID_3_" points="5.1,34.3 34.5,34.3 34.5,6 5.1,6 5.1,34.3 "/> </defs> <clipPath id="SVGID_4_"> <use xlink:href="#SVGID_3_" style="overflow:visible;"/> </clipPath> <path class="st2" d="M10.2,32.4h20.2c1.4,0,2.5-1.1,2.5-2.5V11.1c0-1.4-1.1-2.5-2.5-2.5H10.2c-1.4,0-2.5,1.1-2.5,2.5v18.7 C7.7,31.2,8.8,32.4,10.2,32.4L10.2,32.4z"/> <g class="st3"> <defs> <polygon id="SVGID_5_" points="5.1,34.3 34.5,34.3 34.5,6 5.1,6 5.1,34.3 "/> </defs> <clipPath id="SVGID_6_"> <use xlink:href="#SVGID_5_" style="overflow:visible;"/> </clipPath> <g class="st4"> <defs> <polygon id="SVGID_7_" points="10.9,30.7 29.8,30.7 29.8,9.6 10.9,9.6 10.9,30.7 "/> </defs> <clipPath id="SVGID_8_"> <use xlink:href="#SVGID_7_" style="overflow:visible;"/> </clipPath> <g class="st5"> <defs> <polygon id="SVGID_9_" points="10.9,30.7 29.8,30.7 29.8,9.6 10.9,9.6 10.9,30.7 "/> </defs> <clipPath id="SVGID_10_"> <use xlink:href="#SVGID_9_" style="overflow:visible;"/> </clipPath> <path class="st6" d="M17.2,30.5c-0.7-0.3-1-0.9-1-1.7c0.1-1.8,0-3.6,0-5.4c0-0.2,0-0.3,0-0.5c0.8,0.6,1.7,1.1,2.6,1.8 c0,1.4,0,3,0,4.5c0,0.6-0.4,0.9-0.9,1.2C17.7,30.5,17.5,30.5,17.2,30.5L17.2,30.5z"/> <path class="st6" d="M20.9,30.5c-0.7-0.4-0.9-1-0.9-1.8c0.1-1.3,0-2.5,0-3.8c0.9-0.1,1.7-0.2,2.6-0.3c0,0.8,0,1.7,0,2.6 c0,0.5,0,1.1,0,1.6c0.1,0.8-0.2,1.4-1,1.7C21.4,30.5,21.1,30.5,20.9,30.5L20.9,30.5z"/> <path class="st6" d="M19.9,9.6c0.6,0.2,1.2,0.6,1.4,1.3c0.4,1-0.1,2.1-1.1,2.5c-1,0.4-2.1-0.1-2.5-1c-0.4-1,0-2.1,0.9-2.5 c0.1-0.1,0.3-0.1,0.4-0.2C19.3,9.6,19.6,9.6,19.9,9.6L19.9,9.6z"/> <path class="st6" d="M25,21.6c1.5,1.5,3,3,4.4,4.4c0.5,0.5,0.4,1.3-0.1,1.8c-0.5,0.5-1.3,0.5-1.8,0.1c-1.5-1.4-3-2.9-4.4-4.4 c-2.7,1.4-5.3,0.2-6.5-1.5c-1.3-1.9-1.1-4.5,0.6-6.2c1.6-1.7,4.3-1.9,6.2-0.6C25.1,16.2,26.4,18.7,25,21.6L25,21.6z M24.5,19.1c0-2.1-1.7-3.8-3.8-3.8c-2.1,0-3.8,1.7-3.8,3.8c0,2.1,1.7,3.8,3.8,3.8S24.5,21.3,24.5,19.1L24.5,19.1z"/> <path class="st6" d="M17.4,14.4c-0.5,0.7-1.1,1.4-1.7,2c-0.1,0.1-0.3,0.2-0.4,0.2c-1.1,0-2.2,0-3.2,0c-0.8,0-1.2-0.5-1.2-1.2 c0-0.6,0.5-1,1.2-1c1.7,0,3.3,0,5,0C17.2,14.4,17.3,14.4,17.4,14.4L17.4,14.4z"/> <path class="st6" d="M24,14.4c1,0,2.1,0,3.2,0c0.5,0,0.9,0.5,0.9,1c0,0.5-0.3,1-0.8,1.1c-0.5,0.1-0.9,0.1-1.4,0.1 c-0.1,0-0.2-0.1-0.3-0.2C25.1,15.7,24.5,15,24,14.4L24,14.4z"/> <path class="st6" d="M22.6,19.2c0,0.7,0,1.3,0,2c0,0.2-0.1,0.5-0.3,0.6c-1.2,0.8-2.9,0.5-3.9-0.5c-1-1.2-1-2.9-0.1-4 c1-1.1,2.6-1.4,3.9-0.7c0.3,0.2,0.4,0.3,0.4,0.7C22.6,17.9,22.6,18.5,22.6,19.2L22.6,19.2z"/> </g> </g> </g> </g> </g> </g> </svg> ';
    this.chart.selectAll(".icon-symptoms")
      .data(this.datasetB)
      .enter().append('svg')
      //.attr("id","Layer_1")
      .attr("x",d => 
      this.chartState.xScale(d.questionnaireDate_mod))
      .attr("y","-17")
      .attr("height","32")
      .attr("width","32")
      .attr("viewBox","0 0 40 40")
      //.style("enable-background","new 0 0 40 40")
       
     // .attr("xml:space","preserve")
     .html(svgImage)
     .attr('class', 'x-axis-arrow')
     .attr('d', this.pathUpdate)
    //  .attr('transform', d => {
    //    return `translate(${(this.chartState.xScale(d.questionnaireDate_mod))},-12)`;
    //  })
      //.enter().append('foreignObject')
      // .attr('class', 'x-axis-arrow')
      // .attr('d', this.pathUpdate)
      // .attr('transform', d => {
      //   return `translate(${(this.chartState.xScale(d.questionnaireDate_mod))},-12)`;
      // })
      // .append('xhtml:span')
      // .attr('class', 'icon-symptoms')
      // .style("background-color", "#EA700D")
      // .style("border-radius", "5px")
      // .style("padding", "2px")
      // .style("color", "#ffffff")
      // .style("font-size", "20px")
      // .style("width", "20px")
      // .style("height", "21px")
      // .style("display", "block")
      // .attr("width", 30)
      // .attr("height", 30)     
      //.enter().append("image")
      //.attr("xlink:href", "https://github.com/favicon.ico")
      // .attr("width", 16)
      // .attr("height", 16)
      //.attr("class", "dot")
      //.style("stroke", "red")
      .on('click', d => {
        this.showSecondLevel(d);
      })

  }
}
