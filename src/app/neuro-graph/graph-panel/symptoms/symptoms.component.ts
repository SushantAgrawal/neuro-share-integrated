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
  registerDrag: any;
  constructor(private brokerService: BrokerService, public dialog: MdDialog, private neuroGraphService: NeuroGraphService) {
    this.registerDrag = e => neuroGraphService.registerDrag(e);
    this.paramData = this.neuroGraphService.get('queryParams')
    this.setInnerSVGPolyfill();
  }
  ngOnInit() {

    this.subscriptions = this
      .brokerService
      .filterOn(allHttpMessages.httpGetAllQuestionnaire)
      .subscribe(d => {
        d.error
          ? (() => {
            console.log(d.error);
            this.brokerService.emit(allMessages.checkboxEnable, 'symptoms');
          })()
          : (() => {
            try {
              //this.questionaireData = d.data.questionaires.sort((a:any, b:any) => new Date(a["qx_completed_at"]) - b["qx_completed_at"]);
              d.data && (this.questionaireData = d.data.questionaires || []);

              if (this.questionaireData && this.questionaireData.length > 0) {

                this.questionaireData = d.data.questionaires.map(d => {
                  return {
                    ...d,
                    qxCompleted: new Date(this.neuroGraphService.moment(d["qx_completed_at"]).format("MM/DD/YYYY")),
                  }
                }).sort((a, b) => b.qxCompleted - a.qxCompleted)
                let index = 0;

                this.questionaireData.forEach(element => {
                  let symptomsDataLocal: Array<any> = [];
                  for (let i = 0; i < element.symptoms.length; i++) {
                    let symptomStatus: any = "";
                    let reportedDate: any;
                    let qData: Array<any> = [];
                    reportedDate = element["qx_completed_at"];
                    qData.push(element.responses.filter(item => element.symptoms[i].qx_code.some(f => f == item["qx_code"])));
                    let prevCnt = 0;
                    let newCnt = this.questionaireData.length;
                    if (index == 0) {
                      newCnt = this.questionaireData.length - 1;

                    }
                    else {
                      newCnt = this.questionaireData.length - 2;

                    }
                    let trend: Array<any> = [];
                    let answerOptions: Array<any> = [];
                    let answerText: any = "";
                    let questionText: any = "";
                    let cnt = 40;
                    this.questionaireData.forEach(elem => {
                      if (element["qx_id"] != elem["qx_id"] && new Date(this.neuroGraphService.moment(elem["qx_completed_at"]).format("MM/DD/YYYY")) < new Date(this.neuroGraphService.moment(element["qx_completed_at"]).format("MM/DD/YYYY"))) {
                        if (element.symptoms[i].score != "") {
                          if (new Date(this.neuroGraphService.moment(reportedDate).format("MM/DD/YYYY")) >= new Date(this.neuroGraphService.moment(element["qx_completed_at"]).format("MM/DD/YYYY")))
                            reportedDate = element["qx_completed_at"];
                          if (elem.symptoms[i].score == "") {
                            newCnt--;
                          }
                        }
                        else {
                          if (elem.symptoms[i].score != "" && element.symptoms[i].score == "") {
                            prevCnt++;
                            reportedDate = elem["qx_completed_at"];
                            element.symptoms[i].score = elem.symptoms[i].score;
                            qData = [];
                            qData.push(elem.responses.filter(item => elem.symptoms[i].qx_code.some(f => f == item["qx_code"])));

                          }
                        }
                        if (cnt >= 20) {
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
                            if (isNaN(elem.symptoms[i].score)) {
                              trend.push({
                                index: Number(elem.symptoms[i].score),
                                x: cnt,
                                score: elem.symptoms[i].score

                              });
                            }
                            else {
                              trend.push({
                                index: Number(elem.symptoms[i].score),
                                x: cnt,
                                score: elem.symptoms[i].score * 10

                              });
                            }

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
                        if (isNaN(element.symptoms[i].score)) {
                          trend.push({
                            index: Number(element.symptoms[i].score),
                            x: 60,
                            score: element.symptoms[i].score

                          });
                        }
                        else {
                          trend.push({
                            index: Number(element.symptoms[i].score),
                            x: 60,
                            score: element.symptoms[i].score * 10

                          });
                        }

                      }
                    }
                    if (newCnt == 0) {
                      symptomStatus = "New";
                      trend = [];

                    }
                    if (prevCnt > 0) {
                      symptomStatus = "Previous";
                    }
                    let trendScore = 0;
                    if (Number(element.symptoms[i].score)) {
                      trendScore = (Number(element.symptoms[i].score)) * 10;
                    }
                    else {
                      trendScore = element.symptoms[i].score;
                    }
                    var data = {
                      name: element.symptoms[i].title,
                      nameTrend: element.symptoms[i].title.split(' ').join('_'),
                      score: isNaN(element.symptoms[i].score) ? element.symptoms[i].score : element.symptoms[i].score == 0 ? '' : element.symptoms[i].score * 10,
                      trendScore: trendScore,
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
                  index++;
                });
                this.createChartSymptoms();
              }
              this.symptomsChartLoaded = true;
              this.brokerService.emit(allMessages.checkboxEnable, 'symptoms');

              //custom error handling
              var isValidDate = true;
              var isComplete = true;
              this.questionaireSymptomData.forEach(obj => {
                if (obj.status.toUpperCase() != "COMPLETED") {
                  isComplete = false;
                }
                if (obj.symptoms.some(symp => symp.score == 'No result'))
                  isValidDate = false;
              });
              var ErrorCode: string = '';
              if (this.questionaireSymptomData.length == 0)
                this.brokerService.emit(allMessages.showCustomError, 'M-002');
              else {
                if (!isValidDate)
                  ErrorCode = ErrorCode.indexOf('D-002') != -1 ? ErrorCode : ErrorCode == '' ? 'D-002' : ErrorCode + ',' + 'D-002';
                if (!isComplete)
                  ErrorCode = ErrorCode.indexOf('U-004') != -1 ? ErrorCode : ErrorCode == '' ? 'U-004' : ErrorCode + ',' + 'U-004';
                if (ErrorCode != '')
                  this.brokerService.emit(allMessages.showCustomError, ErrorCode);
              }
            }
            catch (ex) {
              console.log(ex);
              this.brokerService.emit(allMessages.showLogicalError, 'symptoms');
            }
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
            //make api call
            this
              .brokerService
              .httpGet(allHttpMessages.httpGetAllQuestionnaire, [
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
    this.symptomsData = data;
    let dialogConfig = { panelClass: 'ns-symptoms-theme', width: '750px' };
    this.dialogRef = this.dialog.open(this.symptomSecondLevelTemplate, dialogConfig);
    this.dialogRef.updatePosition({ top: '153px', left: '278px' });
    this.dialogRef.afterOpen().subscribe((ref: MdDialogRef<any>) => {
      this.plottrendlineSymptoms();
    });
  }
  plottrendlineSymptoms() {
    if (this.symptomsData.symptoms.length > 0) {
      this.symptomsData.symptoms.forEach(elems => {
        if (elems.trends.length > 1)
          this.drawtrendLineSymptoms(elems.qxid, elems.trendScore, elems.nameTrend, elems.trends)
      });
    }

  }
  drawtrendLineSymptoms(qid, scoreid, compName, trendData) {
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
    let dialogConfig = { panelClass: 'ns-symptoms-theme', width: '350px', height: '350px' };
    this.questDialogRef = this.dialog.open(this.symptomsThirdLevelTemplate, dialogConfig);
    this.questDialogRef.updatePosition({ top: '250px', left: '465px' });
  }

  createChartSymptoms() {
    this.datasetB = this.questionaireSymptomData.map(d => {
      return {
        ...d,
        questionnaireDate_mod: new Date(this.neuroGraphService.moment(d.questionnaireDate).format("MM/DD/YYYY")),

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

    let svgImage = '<g> <g> <path style="fill-rule:evenodd;clip-rule:evenodd;fill:#EA700D;" d="M10.2,32.4h20.2c1.4,0,2.5-1.1,2.5-2.5V11.1c0-1.4-1.1-2.5-2.5-2.5H10.2c-1.4,0-2.5,1.1-2.5,2.5v18.7 C7.7,31.2,8.8,32.4,10.2,32.4L10.2,32.4z"/> <g class="st1"> <path style="fill:none;stroke:#EA700D;stroke-width:1.7638;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" d="M10.2,32.4h20.2c1.4,0,2.5-1.1,2.5-2.5V11.1c0-1.4-1.1-2.5-2.5-2.5H10.2c-1.4,0-2.5,1.1-2.5,2.5v18.7 C7.7,31.2,8.8,32.4,10.2,32.4L10.2,32.4z"/> <g class="st3"> <g class="st4"> <g class="st5"> <path style="fill:#FFFFFF;" d="M17.2,30.5c-0.7-0.3-1-0.9-1-1.7c0.1-1.8,0-3.6,0-5.4c0-0.2,0-0.3,0-0.5c0.8,0.6,1.7,1.1,2.6,1.8 c0,1.4,0,3,0,4.5c0,0.6-0.4,0.9-0.9,1.2C17.7,30.5,17.5,30.5,17.2,30.5L17.2,30.5z"/> <path style="fill:#FFFFFF;" d="M20.9,30.5c-0.7-0.4-0.9-1-0.9-1.8c0.1-1.3,0-2.5,0-3.8c0.9-0.1,1.7-0.2,2.6-0.3c0,0.8,0,1.7,0,2.6 c0,0.5,0,1.1,0,1.6c0.1,0.8-0.2,1.4-1,1.7C21.4,30.5,21.1,30.5,20.9,30.5L20.9,30.5z"/> <path style="fill:#FFFFFF;" d="M19.9,9.6c0.6,0.2,1.2,0.6,1.4,1.3c0.4,1-0.1,2.1-1.1,2.5c-1,0.4-2.1-0.1-2.5-1c-0.4-1,0-2.1,0.9-2.5 c0.1-0.1,0.3-0.1,0.4-0.2C19.3,9.6,19.6,9.6,19.9,9.6L19.9,9.6z"/> <path style="fill:#FFFFFF;" d="M25,21.6c1.5,1.5,3,3,4.4,4.4c0.5,0.5,0.4,1.3-0.1,1.8c-0.5,0.5-1.3,0.5-1.8,0.1c-1.5-1.4-3-2.9-4.4-4.4 c-2.7,1.4-5.3,0.2-6.5-1.5c-1.3-1.9-1.1-4.5,0.6-6.2c1.6-1.7,4.3-1.9,6.2-0.6C25.1,16.2,26.4,18.7,25,21.6L25,21.6z M24.5,19.1c0-2.1-1.7-3.8-3.8-3.8c-2.1,0-3.8,1.7-3.8,3.8c0,2.1,1.7,3.8,3.8,3.8S24.5,21.3,24.5,19.1L24.5,19.1z"/> <path style="fill:#FFFFFF;" d="M17.4,14.4c-0.5,0.7-1.1,1.4-1.7,2c-0.1,0.1-0.3,0.2-0.4,0.2c-1.1,0-2.2,0-3.2,0c-0.8,0-1.2-0.5-1.2-1.2 c0-0.6,0.5-1,1.2-1c1.7,0,3.3,0,5,0C17.2,14.4,17.3,14.4,17.4,14.4L17.4,14.4z"/> <path style="fill:#FFFFFF;" d="M24,14.4c1,0,2.1,0,3.2,0c0.5,0,0.9,0.5,0.9,1c0,0.5-0.3,1-0.8,1.1c-0.5,0.1-0.9,0.1-1.4,0.1 c-0.1,0-0.2-0.1-0.3-0.2C25.1,15.7,24.5,15,24,14.4L24,14.4z"/> <path style="fill:#FFFFFF;" d="M22.6,19.2c0,0.7,0,1.3,0,2c0,0.2-0.1,0.5-0.3,0.6c-1.2,0.8-2.9,0.5-3.9-0.5c-1-1.2-1-2.9-0.1-4 c1-1.1,2.6-1.4,3.9-0.7c0.3,0.2,0.4,0.3,0.4,0.7C22.6,17.9,22.6,18.5,22.6,19.2L22.6,19.2z"/> </g> </g> </g> </g> </g> </g>';

    this.chart.selectAll(".icon-symptoms")
      .data(this.datasetB)
      .enter().append('svg')
      .attr("x", d =>
        this.chartState.xScale(d.questionnaireDate_mod))
      .attr("y", "-17")
      .attr("height", "32")
      .attr("width", "32")
      .attr("viewBox", "0 0 40 40")
      .html(svgImage)
      .style('cursor', 'pointer')
      .attr('d', this.pathUpdate)
      .on('click', d => {
        this.showSecondLevel(d);
      })
    //   this.chart.selectAll('.dot-walk25feet')
    //   .data(this.datasetB)
    //   .enter()
    //   .append('circle')
    //   .attr('class', 'dot-walk25feet')
    //   .attr('cx', d => (this.chartState.xScale(d.questionnaireDate_mod)) + 35)
    //   .attr('cy', "-17")
    //   .attr('r', 10)
    //   .style('fill', "yellow")
    //   .style('cursor', 'pointer')

    // //Adds labels for clinician data
    // this.chart.selectAll('.label-test')
    //   .data(this.datasetB)
    //   .enter()
    //   .append('text')
    //   .attr('class', 'label-test')
    //   .style('font-size', '10px')
    //   .attr("x", d =>
    //     (this.chartState.xScale(d.questionnaireDate_mod)) + 32.5)
    //   .attr("y", "-15")
    //   .text("3");

  }
  setInnerSVGPolyfill() {
    var serializeXML = function (node, output) {
      var nodeType = node.nodeType;
      if (nodeType == 3) { // TEXT nodes.
        // Replace special XML characters with their entities.
        output.push(node.textContent.replace(/&/, '&amp;').replace(/</, '&lt;').replace('>', '&gt;'));
      } else if (nodeType == 1) { // ELEMENT nodes.
        // Serialize Element nodes.
        output.push('<', node.tagName);
        if (node.hasAttributes()) {
          var attrMap = node.attributes;
          for (var i = 0, len = attrMap.length; i < len; ++i) {
            var attrNode = attrMap.item(i);
            output.push(' ', attrNode.name, '=\'', attrNode.value, '\'');
          }
        }
        if (node.hasChildNodes()) {
          output.push('>');
          var childNodes = node.childNodes;
          for (var i = 0, len = childNodes.length; i < len; ++i) {
            serializeXML(childNodes.item(i), output);
          }
          output.push('</', node.tagName, '>');
        } else {
          output.push('/>');
        }
      } else if (nodeType == 8) {
        // TODO(codedread): Replace special characters with XML entities?
        output.push('<!--', node.nodeValue, '-->');
      } else {
        // TODO: Handle CDATA nodes.
        // TODO: Handle ENTITY nodes.
        // TODO: Handle DOCUMENT nodes.
        throw 'Error serializing XML. Unhandled node of type: ' + nodeType;
      }
    }
    // The innerHTML DOM property for SVGElement.
    Object.defineProperty(SVGElement.prototype, 'innerHTML', {
      get: function () {
        var output = [];
        var childNode = this.firstChild;
        while (childNode) {
          serializeXML(childNode, output);
          childNode = childNode.nextSibling;
        }
        return output.join('');
      },
      set: function (markupText) {
        // Wipe out the current contents of the element.
        while (this.firstChild) {
          this.removeChild(this.firstChild);
        }

        try {
          // Parse the markup into valid nodes.
          var dXML = new DOMParser();

          //dXML.async = false;
          // Wrap the markup into a SVG node to ensure parsing works.
          var sXML = '<svg xmlns=\'http://www.w3.org/2000/svg\'>' + markupText + '</svg>';
          var svgDocElement = dXML.parseFromString(sXML, 'text/xml').documentElement;

          // Now take each node, import it and append to this element.
          var childNode = svgDocElement.firstChild;
          while (childNode) {
            this.appendChild(this.ownerDocument.importNode(childNode, true));
            childNode = childNode.nextSibling;
          }
        } catch (e) {
          throw new Error('Error parsing XML string');
        };
      }
    });

    // The innerSVG DOM property for SVGElement.
    Object.defineProperty(SVGElement.prototype, 'innerSVG', {
      get: function () {
        return this.innerHTML;
      },
      set: function (markupText) {
        this.innerHTML = markupText;
      }
    });

  };
}
