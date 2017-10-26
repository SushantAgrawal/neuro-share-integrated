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
  private symptomsData: Array<any>;
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
            this.symptomsData = d.data.relapses;
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
   
      let dialogConfig = { hasBackdrop: false, panelClass: 'ns-symptoms-theme', width: '750px' };
      this.dialogRef = this.dialog.open(this.symptomSecondLevelTemplate, dialogConfig);
  }
  showThirdLayer()
  {
    this.dialog.openDialogs.pop();
    let dialogConfig = { hasBackdrop: false, skipHide: true, panelClass: 'ns-symptoms-theme', width: '350px', height: '350px' };
    this.questDialogRef = this.dialog.open(this.symptomsThirdLevelTemplate, dialogConfig);
    //this.questDialogRef.updatePosition({ top: '50px', left: "860px" });
  }
  
  createChartSymptoms() {
    this.datasetB = this.symptomsData.map(d => {
      let relMonth = this.month.indexOf(d.relapse_month);
      let relYear = parseInt(d.relapse_year);
      return {
        ...d,
        last_updated_instant: d.relapse_month + "/15/" + d.relapse_year,
        lastUpdatedDate: new Date(relYear, relMonth, 15),
        confirm: d.clinician_confirmed,
        month: d.relapse_month,
        year: d.relapse_year
      }
    }).sort((a, b) => a.lastUpdatedDate - b.lastUpdatedDate);

    let element = d3.select("#symptoms");
    this.width = GRAPH_SETTINGS.panel.offsetWidth - GRAPH_SETTINGS.panel.marginLeft - GRAPH_SETTINGS.panel.marginRight;
    this.height = GRAPH_SETTINGS.panel.offsetHeight - GRAPH_SETTINGS.panel.marginTop - GRAPH_SETTINGS.panel.marginBottom;

    this.yScale = d3
      .scaleLinear()
      .domain(this.yDomain)
      .range([GRAPH_SETTINGS.symptoms.chartHeight - 20, 0]);

    this.line = d3.line<any>()
      .x((d: any) => this.chartState.xScale(d.lastUpdatedDate))
      .y((d: any) => 0);

    this.chart = d3.select("#symptoms")
      .attr("transform", "translate(" + GRAPH_SETTINGS.panel.marginLeft + "," + GRAPH_SETTINGS.symptoms.positionTop + ")");

    this.pathUpdate = this.chart.append("path")
      .datum([
        { "lastUpdatedDate": this.chartState.xDomain.defaultMinValue },
        { "lastUpdatedDate": this.chartState.xDomain.defaultMaxValue }
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
      return `translate(${(this.chartState.xScale(d.lastUpdatedDate))},-10)`;
    })
    .append('xhtml:span')
    .attr('class','icon-symptoms')
    .style("background-color", "#EA700D")
    .style("border-radius", "5px")
    .style("padding", "2px")
    .style("color", "#ffffff")
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
