import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import * as d3 from 'd3';
import { BrokerService } from '../../broker/broker.service';
import { allMessages, allHttpMessages, manyHttpMessages, medication, GRAPH_SETTINGS } from '../../neuro-graph.config';
import { searchObject } from '../../neuro-graph.helper';
import { NeuroGraphService } from '../../neuro-graph.service';

@Component({
  selector: '[app-medications]',
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MedicationsComponent implements OnInit, OnDestroy {
  @ViewChild('dmtSecondLevelTemplate') private dmtSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('vitaminDSecondLevelTemplate') private vitaminDSecondLevelTemplate: TemplateRef<any>;
  @ViewChild('otherMedsSecondLevelTemplate') private otherMedsSecondLevelTemplate: TemplateRef<any>;
  @Input() private chartState: any;

  graphDimension = GRAPH_SETTINGS.panel;
  chartsWidth = GRAPH_SETTINGS.medications.chartsWidth;
  dialogRef: MdDialogRef<any>;
  medSecondLayerModel: any;
  subscriptions: any;
  allMedicationData: Array<any> = [];
  dmtArray: Array<any> = [];
  vitaminDArray: Array<any> = [];
  otherMedsArray: Array<any> = [];
  registerDrag: any;
  queryParams: any;
  selectedMed = {
    dmt: false,
    otherMeds: false,
    vitaminD: false
  };
  medType = {
    dmt: 'dmt',
    otherMeds: 'otherMeds',
    vitaminD: 'vitaminD'
  };
  dmtSecondLayerLocalData: Array<any>;
  otherMedsSecondLayerLocalData: Array<any>;
  relapsesLocalData: Array<any>;
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  constructor(private brokerService: BrokerService, private dialog: MdDialog, private neuroGraphService: NeuroGraphService) {
    this.registerDrag = e => neuroGraphService.registerDrag(e);
    this.queryParams = this.neuroGraphService.get("queryParams");
  }

  ngOnInit() {
    this.subscriptions = this.brokerService.filterOn('MEDICATIONS_ALL_DATA').subscribe(d => {
      d.error
        ? (() => {
          console.log(d.error);
          this.brokerService.emit(allMessages.checkboxEnable, 'dmt');
        })()
        : (() => {
          this.prepareMedications(d.data[0][allHttpMessages.httpGetMedications]);
          
          let dmtResponse = d.data[1][allHttpMessages.httpGetDmt];
          let otherMedsResponse = d.data[2][allHttpMessages.httpGetOtherMeds];
          let relapsesLocalData = d.data[3][allHttpMessages.httpGetRelapse];
          this.dmtSecondLayerLocalData = dmtResponse.DMTs;
          this.otherMedsSecondLayerLocalData = otherMedsResponse.Other_Meds;
          this.relapsesLocalData = relapsesLocalData.relapses;

          if (this.selectedMed[this.medType.dmt]) {
            this.checkForError(this.dmtArray);
            if (!this.relapsesLocalData || this.relapsesLocalData.length == 0) {
              this.brokerService.emit(allMessages.showCustomError, 'M-002');
            }
            this.drawDmt();
          }
          if (this.selectedMed[this.medType.vitaminD]) {
            this.checkForError(this.vitaminDArray);
            this.drawVitaminD();
          }
          if (this.selectedMed[this.medType.otherMeds]) {
            this.checkForError(this.otherMedsArray);
            this.drawOtherMeds();
          }
         
          this.brokerService.emit(allMessages.checkboxEnable, 'dmt');
        })();
    });
    let neuroRelated = this.brokerService.filterOn(allMessages.neuroRelated);
    this.processMedication(neuroRelated, this.medType.dmt);
    this.processMedication(neuroRelated, this.medType.vitaminD);
    this.processMedication(neuroRelated, this.medType.otherMeds);

    let subScaleUpdate = this.brokerService.filterOn(allMessages.graphScaleUpdated).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        if (this.selectedMed.dmt) {
          this.removeDmt();
          if (d.data.fetchData) {
            this.brokerService.emit(allMessages.neuroRelated, { artifact: this.medType.dmt, checked: true });
          }
          else {
            this.drawDmt();
          }
        }
        if (this.selectedMed.otherMeds) {
          this.removeOtherMeds();
          if (d.data.fetchData) {
            this.brokerService.emit(allMessages.neuroRelated, { artifact: this.medType.otherMeds, checked: true });
          }
          else {
            this.drawOtherMeds();
          }
        }
        if (this.selectedMed.vitaminD) {
          this.removeVitaminD();
          if (d.data.fetchData) {
            this.brokerService.emit(allMessages.neuroRelated, { artifact: this.medType.vitaminD, checked: true });
          }
          else {
            this.drawVitaminD();
          }
        }
      })();
    })

    let subDmtPost = this.brokerService.filterOn(allHttpMessages.httpPostDmt).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        let params =
          this.dmtSecondLayerLocalData.push({
            dmt_order_id: this.medSecondLayerModel.orderIdentifier.toString(),
            patient_reported_start: `${this.medSecondLayerModel.patientReportedStartDateMonth}/${this.medSecondLayerModel.patientReportedStartDateYear}`,
            reason_stopped: this.medSecondLayerModel.reasonStopped,
            other_reason: this.medSecondLayerModel.otherReason,
            last_updated_provider_id: this.queryParams.provider_id,
            last_updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
            save_csn: this.queryParams.csn,
            save_csn_status: this.queryParams.csn_status
          });
        this.dialogRef.close();
      })();
    })

    let subDmtPut = this.brokerService.filterOn(allHttpMessages.httpPutDmt).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        let med = d.carryBag.dmt;
        med.patient_reported_start = `${this.medSecondLayerModel.patientReportedStartDateMonth}/${this.medSecondLayerModel.patientReportedStartDateYear}`;
        med.reason_stopped = this.medSecondLayerModel.reasonStopped;
        med.other_reason = this.medSecondLayerModel.otherReason;
        med.otherReason = this.medSecondLayerModel.otherReason;
        this.dialogRef.close();
      })();
    })

    let subOtherMedsPost = this.brokerService.filterOn(allHttpMessages.httpPostOtherMeds).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.otherMedsSecondLayerLocalData.push({
          other_med_order_id: this.medSecondLayerModel.orderIdentifier.toString(),
          reason_for_med: this.medSecondLayerModel.reasonForMed,
          last_updated_provider_id: this.queryParams.provider_id,
          last_updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
          save_csn: this.queryParams.csn,
          save_csn_status: this.queryParams.csn_status
        });
        this.dialogRef.close();
      })();
    })

    let subOtherMedsPut = this.brokerService.filterOn(allHttpMessages.httpPutOtherMeds).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        let med = d.carryBag.otherMed;
        med.reason_for_med = this.medSecondLayerModel.reasonForMed;
        this.dialogRef.close();
      })();
    })

    this.subscriptions
      .add(subScaleUpdate)
      .add(subDmtPost)
      .add(subDmtPut)
      .add(subOtherMedsPost)
      .add(subOtherMedsPut)
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  processMedication(neuroRelated, medication) {
    // A medication was checked
    let sub1 = neuroRelated.filter(t => t.data.artifact == medication && t.data.checked).subscribe(d => {
      d.error
        ? (() => {
          console.log(d.error)
        })
        : (() => {
          this.selectedMed[medication] = true;
          let qParams: any = [
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
          ];
          let qParamsEhr: any = [
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
              value: this.neuroGraphService.moment(this.chartState.dataBufferPeriod.toDate).format('MM/DD/YYYY')
            }
          ];
          this.brokerService.httpGetMany('MEDICATIONS_ALL_DATA', [
            {
              urlId: allHttpMessages.httpGetMedications,
              queryParams: qParamsEhr
            },
            {
              urlId: allHttpMessages.httpGetDmt,
              queryParams: qParams
            },
            {
              urlId: allHttpMessages.httpGetOtherMeds,
              queryParams: qParams
            },
            {
              urlId: allHttpMessages.httpGetRelapse,
              queryParams: qParams
            }
          ]);
        })();
    })

    //A medication was unchecked
    let sub2 = neuroRelated.filter(t => {
      return ((t.data.artifact == medication) && (!t.data.checked));
    }).subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          this.selectedMed[medication] = false;
          if (medication == this.medType.dmt) {
            this.removeDmt()
          } else if (medication == this.medType.vitaminD) {
            this.removeVitaminD()
          } else {
            this.removeOtherMeds()
          }
        })();
    });
    this
      .subscriptions
      .add(sub1)
      .add(sub2);
  }

  prepareMedications(data) {
    let medicationOrders: Array<any> = [];
    data && data.EPIC && data.EPIC.patients && (data.EPIC.patients.length > 0) && (medicationOrders = data.EPIC.patients[0].medicationOrders);
    let genericNames = medication
      .dmt
      .genericNames
      .toString()
      .toLowerCase()
      .split(',');
    let vitaminDIds = medication.vitaminD.ids;
    let otherMedsIds = medication.otherMeds.ids;
    let mappedCodes = medication.otherMeds.mappedCodes;

    let hasMatchedMappedCodes = (med) => {
      let matched = [];
      med.associatedDiagnoses.forEach(ad => {
        ad.codeSets.forEach(cs => {
          cs.mappedCode.forEach(mc => {
            if (mappedCodes.find(c => c === mc))
              matched.push(mc)
          });
        });
      });
      return matched.length > 0
    }

    medicationOrders.forEach(x => {
      if (x.medication && genericNames.find(gn => gn === x.medication.simpleGenericName[0].toLowerCase())) {
        x.type = this.medType.dmt
      } else if (x.medication && vitaminDIds.find(id => id.toString() === x.medication.id)) {
        x.type = this.medType.vitaminD
      } else if (x.medication && otherMedsIds.find(id => id.toString() === x.medication.id)) {
        x.type = this.medType.otherMeds
        // } else if (searchObject(x, 'mappedCode', mappedCodes).length > 0) {
        //   x.type = this.medType.otherMeds
        // }
      } else if (hasMatchedMappedCodes(x)) {
        x.type = this.medType.otherMeds
      }
    });

    this.dmtArray = medicationOrders
      .filter(x => x.type == this.medType.dmt)
      .sort((a, b) => Date.parse(b.date.orderDate) - Date.parse(a.date.orderDate));
    this.vitaminDArray = medicationOrders
      .filter(x => x.type == this.medType.vitaminD)
      .sort((a, b) => Date.parse(b.date.orderDate) - Date.parse(a.date.orderDate));
    this.otherMedsArray = medicationOrders
      .filter(x => x.type == this.medType.otherMeds)
      .sort((a, b) => Date.parse(b.date.orderDate) - Date.parse(a.date.orderDate));
  }

  checkForError(meds: Array<any>) {
    if (meds.length == 0) {
      this.brokerService.emit(allMessages.showCustomError, 'M-002');
    }
    else if (!meds.every(m => m.date.length != 0)) {
      this.brokerService.emit(allMessages.showCustomError, 'D-001');
    }
  }

  //Clean up needed
  getSecondLayerModel(data, medType, secondLayerData) {
    let model: any = {
      medicationId: data.medication.id,
      orderIdentifier: data.orderIdentifier,
      name: data.name,
      simpleGenericName: data.medication.simpleGenericName,
      orderDate: data.date.orderDate,
      medEnd: data.date.medEnd,
      medQuantity: data.medQuantity,
      frequency: data.frequency,
      refillCount: data.refillCount,
      refillRemain: data.refillRemain,
      allYears: Array.from(new Array(100), (val, index) => (new Date()).getFullYear() - index)
    };

    if (secondLayerData) {
      model.allowEdit = secondLayerData.save_csn_status !== 'Closed';
      if (medType == this.medType.dmt) {
        model.reasonStopped = secondLayerData.reason_stopped;
        model.otherReason = secondLayerData.other_reason;
        let dtParts = secondLayerData.patient_reported_start.split('/');
        if (dtParts.length == 2) {
          model.patientReportedStartDateMonth = parseInt(dtParts[0]);
          model.patientReportedStartDateYear = parseInt(dtParts[1]);
          model.patientReportedStartDateMonthName = this.months[model.patientReportedStartDateMonth - 1];
        }
      }
      if (medType == this.medType.otherMeds) {
        model.reasonForMed = secondLayerData.reason_for_med;
      }
      if (medType == this.medType.vitaminD) {
        model.medEnded = data.date.medEnded;
      }
    } else {
      model.allowEdit = true;
    }

    if (medType == this.medType.dmt) {
      let medOrderedDt = (new Date(data.date.orderDate));
      medOrderedDt.setDate(1);
      let medEndDt = (new Date(data.date.medEnd))
      medEndDt.setDate(1);
      if (this.relapsesLocalData) {
        model.noOfRelapses = this
          .relapsesLocalData
          .filter(r => {
            let relapseMonthNo = this.months.indexOf(r.relapse_month);
            let relapseYear = parseInt(r.relapse_year);
            let relapseDate = new Date(relapseYear, relapseMonthNo, 1);
            return relapseDate >= medOrderedDt && relapseDate <= medEndDt;
          })
          .length;
      }
    }
    return model;
  }

  updateDmt() {
    let dmt = this.dmtSecondLayerLocalData.find(x => x.dmt_order_id === this.medSecondLayerModel.orderIdentifier.toString());
    let payload = {
      pom_id: this.queryParams.pom_id,
      dmt_order_id: this.medSecondLayerModel.orderIdentifier.toString(),
      patient_reported_start: `${this.medSecondLayerModel.patientReportedStartDateMonth}/${this.medSecondLayerModel.patientReportedStartDateYear}`,
      reason_stopped: this.medSecondLayerModel.reasonStopped,
      provider_id: this.queryParams.provider_id,
      updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
      save_csn: this.queryParams.csn,
      save_csn_status: this.queryParams.csn_status
    }
    if (dmt) {
      this.brokerService.httpPut(allHttpMessages.httpPutDmt, payload, { dmt });
    } else {
      this.brokerService.httpPost(allHttpMessages.httpPostDmt, payload);
    }
  }

  updateOtherMeds() {
    let otherMed = this
      .otherMedsSecondLayerLocalData
      .find(x => x.other_med_order_id === this.medSecondLayerModel.orderIdentifier.toString());
    let payload = {
      pom_id: this.queryParams.pom_id,
      other_med_order_id: this.medSecondLayerModel.orderIdentifier.toString(),
      reason_for_med: this.medSecondLayerModel.reasonForMed,
      last_updated_provider_id: this.queryParams.provider_id,
      last_updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
      save_csn: this.queryParams.csn,
      save_csn_status: this.queryParams.csn_status
    }
    if (otherMed) {
      this.brokerService.httpPut(allHttpMessages.httpPutOtherMeds, payload, { otherMed });
    } else {
      this.brokerService.httpPut(allHttpMessages.httpPostOtherMeds, payload);
    }
  }

  //#region Drawing

  drawDmt() {
    let config = { hasBackdrop: true, panelClass: 'ns-dmt-theme', width: '400px' };
    let openSecondLayer = (selectedData) => {
      let dmt = this.dmtSecondLayerLocalData.find(x => x.dmt_order_id === selectedData.orderIdentifier.toString());
      this.medSecondLayerModel = this.getSecondLayerModel(selectedData, this.medType.dmt, dmt);
      this.dialog.openDialogs.pop();
      this.dialogRef = this.dialog.open(this.dmtSecondLevelTemplate, config);
      this.dialogRef.updatePosition({ top: `${d3.event.clientY - 300}px`, left: `${d3.event.clientX - 200}px` });
    };
    this.drawChart(this.dmtArray, this.medType.dmt, GRAPH_SETTINGS.medications.dmtColor, GRAPH_SETTINGS.medications.dmtOverlapColor, openSecondLayer);
  }

  drawVitaminD() {
    let config = { hasBackdrop: true, panelClass: 'ns-vitaminD-theme', width: '300px' };
    let openSecondLayer = (selectedData) => {
      this.medSecondLayerModel = this.getSecondLayerModel(selectedData, this.medType.vitaminD, false);
      this.dialogRef = this.dialog.open(this.vitaminDSecondLevelTemplate, config);
      this.dialogRef.updatePosition({ top: `${d3.event.clientY - 200}px`, left: `${d3.event.clientX - 150}px` });
    };
    this.drawChart(this.vitaminDArray, this.medType.vitaminD, GRAPH_SETTINGS.medications.vitaminDColor, GRAPH_SETTINGS.medications.vitaminDOverlapColor, openSecondLayer);
  }

  drawOtherMeds() {
    let config = { hasBackdrop: true, panelClass: 'ns-othermeds-theme', width: '400px' };
    let openSecondLayer = (selectedData) => {
      let otherMeds = this.otherMedsSecondLayerLocalData.find(x => x.other_med_order_id === selectedData.orderIdentifier.toString());
      this.medSecondLayerModel = this.getSecondLayerModel(selectedData, this.medType.otherMeds, otherMeds);
      this.dialogRef = this.dialog.open(this.otherMedsSecondLevelTemplate, config);
      this.dialogRef.updatePosition({ top: `${d3.event.clientY - 250}px`, left: `${d3.event.clientX - 200}px` });
    };
    this.drawChart(this.otherMedsArray, this.medType.otherMeds, GRAPH_SETTINGS.medications.otherMedsColor, GRAPH_SETTINGS.medications.otherMedsOverlapColor, openSecondLayer);
  }

  removeDmt() {
    this.removeChart(this.medType.dmt);
  }

  removeVitaminD() {
    this.removeChart(this.medType.vitaminD);
  }

  removeOtherMeds() {
    this.removeChart(this.medType.otherMeds);
  }

  getEndDate(input) {
    if (input)
      return Date.parse(input)
    return this.chartState.xDomain.scaleMaxValue;
  }

  getShortenedName(input) {
    let parts = input && input.split(' ');
    let capitalize = parts[0]
      .toLowerCase()
      .replace(/\b(\w)/g, s => s.toUpperCase())
    return capitalize + ' ...';
  }

  drawChart(allData: Array<any>, containterId, barColor, overlapColor, onClickCallback) {
    let dataset = allData.filter(d => {
      //let dt = new Date(Date.parse(d.date.medStart || d.date.orderDate));
      //return dt >= this.chartState.xDomain.currentMinValue && dt <= this.chartState.xDomain.currentMaxValue;
      let endDt = d.date.medEnd ? new Date(Date.parse(d.date.medEnd)) : this.chartState.xDomain.scaleMaxValue;
      return endDt >= this.chartState.xDomain.currentMinValue;
    });

    //temporary fix to avoid overwrite
    d3.selectAll('#' + containterId).selectAll("*").remove();

    let svg = d3
      .select('#' + containterId)
      .attr('class', containterId + '-elements-wrapper')
      .attr('transform', 'translate(0, 5)');

    //group on generic name
    let groupsUnfiltered = dataset.map(d => d.medication.id);
    let groups = groupsUnfiltered.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

    let rectangles = svg
      .append('g')
      .selectAll('rect')
      .data(dataset)
      .enter();

    //Draws rectangles
    let rect = rectangles
      .append('rect')
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('x', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let pos = this.chartState.xScale(medStartDate);
        return pos < 0 ? 0 : pos;
      })
      .attr('y', function (d: any, i) {
        for (var j = 0; j < groups.length; j++) {
          if (d.medication.id == groups[j]) {
            return j * 27 + 12;
          }
        }
      })
      .attr('width', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let medEndDate = this.getEndDate(d.date.medEnd);
        let timelineMinDate = Date.parse(this.chartState.xDomain.currentMinValue)
        let width = 0;
        if (medStartDate >= timelineMinDate) {
          return this.chartState.xScale(medEndDate) - this.chartState.xScale(medStartDate);
        }
        else {
          return this.chartState.xScale(medEndDate) - this.chartState.xScale(this.chartState.xDomain.currentMinValue);
        }
      })
      .attr('height', 6)
      .attr('stroke', 'none')
      .attr('fill', barColor)
      .style('cursor', 'pointer')
      .on("click", d => {
        onClickCallback(d);
      })
    // //overlapping areas
    // let overlapColor = "grey";
    // if (containterId == "dmt") {
    //   overlapColor = "#303945";
    // }
    // else if (containterId == "otherMeds") {
    //   overlapColor = "#898e90";
    // }
    // else if (containterId == "vitaminD") {
    //   overlapColor = "#a07a1c";
    // }
    rect.each((d1, i, currentNodes) => {
      const current = currentNodes[i];
      let x1 = parseFloat(current.getAttribute("x"));
      let y1 = parseFloat(current.getAttribute("y"));
      let width1 = parseFloat(current.getAttribute("width"));

      //overlap area
      rect.each((d2, j, nextNodes) => {
        const next = nextNodes[j];
        let x2 = parseFloat(next.getAttribute("x"));
        let y2 = parseFloat(next.getAttribute("y"));
        let width2 = parseFloat(next.getAttribute("width"));
        if (current !== next) {
          if (x1 > x2 && (x2 + width2) > x1 && y1 == y2) {
            let x = x1;
            let y = y1;
            let width = Math.abs(width2 - Math.abs(x2 - x1));
            rectangles
              .append('rect')
              .attr('rx', 0)
              .attr('ry', 0)
              .attr('x', x)
              .attr('y', y)
              .attr('width', width)
              .attr('height', 6)
              .attr('stroke', 'none')
              .attr('fill', overlapColor)
              .style('cursor', 'pointer')
            // .on("click", d => {
            //   onClickCallback(d);
            // })
          }
          else if (x1 > x2 && (x2 + width2) == x1 && y1 == y2) {
            let x = x1;
            let y = y1;
            //let width = Math.abs(width2 - Math.abs(x2 - x1));
            rectangles
              .append('rect')
              .attr('rx', 0)
              .attr('ry', 0)
              .attr('x', x)
              .attr('y', y)
              .attr('width', 1)
              .attr('height', 6)
              .attr('stroke', 'none')
              .attr('fill', overlapColor)
              .style('cursor', 'pointer')
            // .on("click", d => {
            //   onClickCallback(d);
            // })
          }
        }

      });
    });

    //Draws texts
    let labels = rectangles
      .append('text')
      .text(d => this.getShortenedName(d.name))
      .attr('x', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let medEndDate = this.getEndDate(d.date.medEnd);
        let width = this.chartState.xScale(medEndDate) - this.chartState.xScale(medStartDate);
        let pos = this.chartState.xScale(medStartDate);
        return pos < 0 ? 0 : pos;
      })
      .attr('y', function (d: any, i) {
        for (let j = 0; j < groups.length; j++) {
          if (d.medication.id == groups[j]) {
            return j * 27 + 8;
          }
        }
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'start')
      .attr('text-height', 40)
      .attr('fill', 'black')
      .style('text-transform', 'capitalize')
      .style('cursor', 'pointer')
      .on("click", d => {
        onClickCallback(d);
      });
    this.arrangeLabels(labels);

    //Adjusts height
    d3.select('#' + containterId)
      .attr('height', groups.length * 30);
    d3.select('#' + containterId)
      .style('display', 'block');
  }

  arrangeLabels(labels) {
    labels.each((d1, i, currentNodes) => {
      const current = currentNodes[i];
      let y1 = parseFloat(current.getAttribute('y'));
      const x1 = parseFloat(current.getAttribute('x'));
      const textLength1 = current.textContent.length * 5;
      labels.each((d2, j, nextNodes) => {
        const next = nextNodes[j];
        if (current !== next) {
          const x2 = parseFloat(next.getAttribute('x'));
          const y2 = parseFloat(next.getAttribute('y'));
          const textLength2 = next.textContent.length * 5;
          if ((Math.abs(x1 - x2) < Math.abs(textLength1)) && (Math.abs(y1) === Math.abs(y2))) {
            next.setAttribute('y', (y2 + 10 * (i + 1)).toString());
            current.setAttribute('y', (y2 + 10 * (i + 2)).toString());
            y1 = parseFloat(next.getAttribute('y'));
          }
        }
      });
    });
  }

  removeChart(containterId) {
    d3.selectAll('#' + containterId)
      .selectAll('*')
      .remove();
    d3.select('#' + containterId)
      .style('display', 'none');
  }
  //#endregion
}
