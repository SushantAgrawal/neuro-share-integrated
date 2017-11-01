import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef, Inject } from '@angular/core';
import * as d3 from 'd3';
import { GRAPH_SETTINGS } from '../../neuro-graph.config';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages } from '../../neuro-graph.config';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { NeuroGraphService } from '../../neuro-graph.service';
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
          ? console.log(d.error)
          : (() => {
            //debugger;
            //this.questionaireData = d.data.questionaires.sort((a:any, b:any) => new Date(a["qx_completed_at"]) - b["qx_completed_at"]);
            this.questionaireData = d.data.questionaires.map(d => {
              return {
                ...d,
                qxCompleted: new Date(d["qx_completed_at"]),
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
                let cnt = 20;
                this.questionaireData.forEach(elem => {
                  //debugger;
                  if (element["qx_id"] != elem["qx_id"] && new Date(elem["qx_completed_at"]) < new Date(element["qx_completed_at"])) {
                    if (element.symptoms[i].score != "") {
                      reportedDate = element["qx_completed_at"];
                      if (elem.symptoms[i].score == "") {
                        newCnt--;
                      }
                    }
                    else {
                      if (elem.symptoms[i].score != "") {
                        prevCnt++;
                        reportedDate = elem["qx_completed_at"];
                        element.symptoms[i].score = elem.symptoms[i].score;
                        qData = [];
                        qData.push(elem.responses.filter(item => elem.symptoms[i].qx_code.some(f => f == item["qx_code"])));

                      }
                    }
                    if (cnt <= 40) {
                      if (elem.symptoms[i].score == "Mild") {
                        trend.push({
                          index: 10,
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt + 20;
                      }
                      else if (elem.symptoms[i].score == "Moderate") {
                        trend.push({
                          index: 20,
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt + 20;
                      }
                      else if (elem.symptoms[i].score == "Severe") {
                        trend.push({
                          index: 30,
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt + 20;
                      }
                      else if (elem.symptoms[i].score != "") {
                        trend.push({
                          index: Number(elem.symptoms[i].score),
                          x: cnt,
                          score: elem.symptoms[i].score

                        });
                        cnt = cnt + 20;
                      }
                    }

                  }

                });
                if (prevCnt <= 0) {
                  if (element.symptoms[i].score == "Mild") {
                    trend.push({
                      index: 10,
                      x: cnt,
                      score: element.symptoms[i].score

                    });
                    cnt = cnt + 20;
                  }
                  else if (element.symptoms[i].score == "Moderate") {
                    trend.push({
                      index: 20,
                      x: cnt,
                      score: element.symptoms[i].score

                    });
                    cnt = cnt + 20;
                  }
                  else if (element.symptoms[i].score == "Severe") {
                    trend.push({
                      index: 30,
                      x: cnt,
                      score: element.symptoms[i].score

                    });
                    cnt = cnt + 20;
                  }
                  else if (element.symptoms[i].score != "") {
                    trend.push({
                      index: Number(element.symptoms[i].score),
                      x: cnt,
                      score: element.symptoms[i].score

                    });
                    cnt = cnt + 20;
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
                  reportDate: reportedDate,
                  trends: trend,
                  questData: qData,
                  qxid: element["qx_id"]
                };
                symptomsDataLocal.push(data)
              }
              this.questionaireSymptomData.push({
                questionnaireDate: element["qx_completed_at"],
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
          ? console.log(d.error)
          : (() => {
            //debugger;
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetSymptoms);
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
    let sub4 = this.brokerService.filterOn(allMessages.zoomOptionChange).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        if (this.symptomsChartLoaded) {
          this.removeChartSymptoms();
          this.createChartSymptoms();
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
        questionnaireDate_mod: new Date(d.questionnaireDate),
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

    this.chart.selectAll(".icon-symptoms")
      .data(this.datasetB)
      .enter().append('foreignObject')
      .attr('class', 'x-axis-arrow')
      .attr('d', this.pathUpdate)
      .attr('transform', d => {
        return `translate(${(this.chartState.xScale(d.questionnaireDate_mod))},-12)`;
      })
      .append('xhtml:span')
      .attr('class', 'icon-symptoms')
      .style("background-color", "#EA700D")
      .style("border-radius", "5px")
      .style("padding", "2px")
      .style("color", "#ffffff")
      .style("font-size", "20px")
      .style("width", "20px")
      .style("height", "21px")
      .style("display", "block")
      .attr("width", 30)
      .attr("height", 30)     
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
