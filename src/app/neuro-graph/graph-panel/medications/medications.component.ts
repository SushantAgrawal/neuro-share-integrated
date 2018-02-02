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
import { allMessages, allHttpMessages, medication, GRAPH_SETTINGS } from '../../neuro-graph.config';
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
  noOfRelapses: any = "";
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
    this.subscriptions = this.brokerService.filterOn(allHttpMessages.httpGetMedications).subscribe(d => {
      d.error
        ? (() => {
          console.log(d.error);
          this.brokerService.emit(allMessages.checkboxEnable, 'dmt');
        })()
        : (() => {
          try {
            this.prepareMedications(d.data);
            if (this.selectedMed[this.medType.dmt]) {
              this.checkForError(this.dmtArray);
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
          }
          catch (e) {
            console.log(e);
            this.brokerService.emit(allMessages.checkboxEnable, 'dmt');
            this.brokerService.emit(allMessages.showLogicalError, 'treatments');
          }
        })();
    });

    let neuroRelated = this.brokerService.filterOn(allMessages.neuroRelated);
    this.processMedication(neuroRelated, this.medType.dmt);
    this.processMedication(neuroRelated, this.medType.vitaminD);
    this.processMedication(neuroRelated, this.medType.otherMeds);


    let subRelapses = this.brokerService.filterOn("DMT_SECOND_LAYER_RELAPSES").subscribe(d => {
      d.error
        ? (() => {
          this.noOfRelapses = "n/a";
          console.log(d.error);
        })()
        : (() => {
          let response = d.data[0][allHttpMessages.httpGetRelapse];
          this.relapsesLocalData = response.relapses || [];
          let selectedData = d.carryBag;
          let medOrderedDt = (new Date(selectedData.date.orderDate));
          medOrderedDt.setDate(1);
          let medEndDt = (new Date(selectedData.date.medEnd))
          medEndDt.setDate(1);
          if (this.relapsesLocalData) {
            this.noOfRelapses = this.relapsesLocalData.filter(r => {
              let relapseMonthNo = this.months.indexOf(r.relapse_month);
              let relapseYear = parseInt(r.relapse_year);
              let relapseDate = new Date(relapseYear, relapseMonthNo, 1);
              return (relapseDate >= medOrderedDt) && (relapseDate <= medEndDt);
            }).length;
          }
        })();
    });

    let subDmtSecondLayer = this.brokerService.filterOn(allHttpMessages.httpGetDmt).subscribe(d => {
      d.error
        ? (() => {
          console.log(d.error);
        })()
        : (() => {
          try {
            this.dmtSecondLayerLocalData = d.data.DMTs || [];
            let selectedData = d.carryBag;
            let dmt;
            this.dmtSecondLayerLocalData && (dmt = this.dmtSecondLayerLocalData.find(x => {
              return selectedData.orderIdentifier && x.dmt_order_id && x.dmt_order_id.toString() === selectedData.orderIdentifier.toString();
            }));
            this.medSecondLayerModel = this.getSecondLayerModel(selectedData, this.medType.dmt, dmt);
            this.dialog.openDialogs.pop();
            let config = { hasBackdrop: true, panelClass: 'ns-dmt-theme', width: '400px' };
            this.dialogRef = this.dialog.open(this.dmtSecondLevelTemplate, config);
            this.dialogRef.updatePosition(selectedData.dialogPosition);
          }
          catch (e) {
            console.log(e);
            this.brokerService.emit(allMessages.showLogicalError, 'treatments');
          }
        })();
    });

    let subOtherMedsSecondLayer = this.brokerService.filterOn(allHttpMessages.httpGetOtherMeds).subscribe(d => {
      d.error
        ? (() => {
          console.log(d.error);
        })()
        : (() => {
          try {
            let otherMedsResponse = d.data;
            this.otherMedsSecondLayerLocalData = otherMedsResponse.Other_Meds || [];
            let selectedData = d.carryBag;
            let otherMeds
            this.otherMedsSecondLayerLocalData && (otherMeds = this.otherMedsSecondLayerLocalData.find(x => {
              return selectedData.orderIdentifier && x.other_med_order_id && x.other_med_order_id.toString() === selectedData.orderIdentifier.toString();
            }));
            this.medSecondLayerModel = this.getSecondLayerModel(selectedData, this.medType.otherMeds, otherMeds);
            let config = { hasBackdrop: true, panelClass: 'ns-othermeds-theme', width: '400px' };
            this.dialogRef = this.dialog.open(this.otherMedsSecondLevelTemplate, config);
            this.dialogRef.updatePosition(selectedData.dialogPosition);
          }
          catch (e) {
            console.log(e);
            this.brokerService.emit(allMessages.showLogicalError, 'treatments');
          }
        })();
    });

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
        this.dialogRef.close();
      })();
    })

    let subDmtPut = this.brokerService.filterOn(allHttpMessages.httpPutDmt).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.dialogRef.close();
      })();
    })

    let subOtherMedsPost = this.brokerService.filterOn(allHttpMessages.httpPostOtherMeds).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.dialogRef.close();
      })();
    })

    let subOtherMedsPut = this.brokerService.filterOn(allHttpMessages.httpPutOtherMeds).subscribe(d => {
      d.error ? console.log(d.error) : (() => {
        this.dialogRef.close();
      })();
    })

    this.subscriptions
      .add(subRelapses)
      .add(subScaleUpdate)
      .add(subDmtPost)
      .add(subDmtPut)
      .add(subOtherMedsPost)
      .add(subOtherMedsPut)
      .add(subDmtSecondLayer)
      .add(subOtherMedsSecondLayer)
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
          this.brokerService.httpGet(allHttpMessages.httpGetMedications, [
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
    let genericNames = medication.dmt.genericNames.toString().toLowerCase().split(',');
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

    medicationOrders = medicationOrders.filter(m => !m.orderStatus || m.orderStatus.toLowerCase() !== 'canceled');

    medicationOrders.forEach(x => {
      if (x.medication && genericNames.find(gn => {
        return x.medication.simpleGenericName && x.medication.simpleGenericName[0] && gn === x.medication.simpleGenericName[0].toLowerCase();
      })) {
        x.type = this.medType.dmt
      } else if (x.medication && vitaminDIds.find(id => id.toString() === x.medication.id)) {
        x.type = this.medType.vitaminD
      } else if (x.medication && otherMedsIds.find(id => id.toString() === x.medication.id)) {
        x.type = this.medType.otherMeds
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
    // if (meds.length == 0) {
    //   this.brokerService.emit(allMessages.showCustomError, 'M-002');
    // }
    // else if (!meds.every(m => m.date.length != 0)) {
    //   this.brokerService.emit(allMessages.showCustomError, 'D-001');
    // }
    if (!meds.every(m => m.date.length != 0)) {
      this.brokerService.emit(allMessages.showCustomError, 'D-001');
    }
  }

  getSecondLayerModel(firstLayerData, medType, secondLayerData) {
    let model: any = {
      medicationId: firstLayerData.medication.id,
      orderIdentifier: firstLayerData.orderIdentifier ? firstLayerData.orderIdentifier.toString() : '',
      contactSerialNumber: firstLayerData.contactSerialNumber ? firstLayerData.contactSerialNumber.toString() : '',
      name: firstLayerData.name,
      simpleGenericName: firstLayerData.medication.simpleGenericName,
      orderDate: firstLayerData.date.orderDate,
      medEnd: firstLayerData.date.medEnd,
      medQuantity: firstLayerData.medQuantity,
      frequency: firstLayerData.frequency,
      refillCount: firstLayerData.refillCount,
      refillRemain: firstLayerData.refillRemain,
      allYears: Array.from(new Array(100), (val, index) => (new Date()).getFullYear() - index)
    };
    if (secondLayerData) {
      model.save_csn_status = secondLayerData.save_csn_status;
      model.allowEdit = !secondLayerData.save_csn_status || secondLayerData.save_csn_status.toUpperCase() !== "CLOSED";

      if (medType == this.medType.dmt) {
        model.reasonStopped = secondLayerData.reason_stopped;
        model.otherReason = secondLayerData.reason_stopped_text;
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
        model.medEnded = firstLayerData.date.medEnded;
      }
    } else {
      model.save_csn_status = this.queryParams.csn_status;
      model.allowEdit = true;
    }
    return model;
  }

  updateDmt() {
    let dmt = this.dmtSecondLayerLocalData.find(x => {
      return x.dmt_order_id === this.medSecondLayerModel.orderIdentifier;
    });
    let payload: any = {
      pom_id: this.queryParams.pom_id,
      dmt_order_id: this.medSecondLayerModel.orderIdentifier,
      patient_reported_start: `${this.medSecondLayerModel.patientReportedStartDateMonth}/${this.medSecondLayerModel.patientReportedStartDateYear}`,
      reason_stopped: this.medSecondLayerModel.reasonStopped,
      reason_stopped_text: this.medSecondLayerModel.otherReason,
      provider_id: this.queryParams.provider_id,
      updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
      save_csn: this.queryParams.csn,
      save_csn_status: this.queryParams.csn_status
    }
    if (dmt) {
      this.brokerService.httpPut(allHttpMessages.httpPutDmt, payload);
    } else {
      this.brokerService.httpPost(allHttpMessages.httpPostDmt, payload);
    }
  }

  updateOtherMeds() {
    let otherMed = this.otherMedsSecondLayerLocalData.find(x => {
      return x.other_med_order_id === this.medSecondLayerModel.orderIdentifier;
    });
    let payload: any = {
      pom_id: this.queryParams.pom_id,
      other_med_order_id: this.medSecondLayerModel.orderIdentifier,
      reason_for_med: this.medSecondLayerModel.reasonForMed,
      // last_updated_provider_id: this.queryParams.provider_id,
      // last_updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY'),
      provider_id: this.queryParams.provider_id,
      updated_instant: this.neuroGraphService.moment(new Date()).format('MM/DD/YYYY HH:mm:ss'),
      save_csn: this.queryParams.csn,
      save_csn_status: this.queryParams.csn_status
    }
    if (otherMed) {
      this.brokerService.httpPut(allHttpMessages.httpPutOtherMeds, payload);
    } else {
      this.brokerService.httpPost(allHttpMessages.httpPostOtherMeds, payload);
    }
  }

  //#region Drawing

  drawDmt() {
    let openSecondLayer = (selectedData) => {
      selectedData.dialogPosition = { top: `${d3.event.clientY - 300}px`, left: `${d3.event.clientX - 200}px` };
      this.noOfRelapses = "";
      this.brokerService.httpGetMany('DMT_SECOND_LAYER_RELAPSES', [
        {
          urlId: allHttpMessages.httpGetRelapse,
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
      ], selectedData);

      this.brokerService.httpGet(allHttpMessages.httpGetDmt, [
        {
          name: 'pom_id',
          value: this.neuroGraphService.get('queryParams').pom_id
        }
      ], null, selectedData);
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
    let openSecondLayer = (selectedData) => {
      selectedData.dialogPosition = { top: `${d3.event.clientY - 250}px`, left: `${d3.event.clientX - 200}px` };
      this.brokerService.httpGet(allHttpMessages.httpGetOtherMeds, [
        {
          name: 'pom_id',
          value: this.neuroGraphService.get('queryParams').pom_id
        }
      ], null, selectedData);

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
    if (!input)
      return '';
    let parts = input.split(' ');
    let capitalize = parts[0].toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase())
    return capitalize + ' ...';
  }

  drawChart(allData: Array<any>, containterId, barColor, overlapColor, onClickCallback) {
    let dataset = allData.filter(d => {
      let endDt = d.date.medEnd ? new Date(Date.parse(d.date.medEnd)) : this.chartState.xDomain.scaleMaxValue;
      return endDt >= this.chartState.xDomain.currentMinValue;
    });

    d3.selectAll('#' + containterId).selectAll("*").remove();

    let svg = d3
      .select('#' + containterId)
      .attr('class', containterId + '-elements-wrapper')
      .attr('transform', 'translate(0, 5)');

    //group on medication id
    let groupsUnfiltered = dataset.map(d => d.medication.id);
    let groups = groupsUnfiltered.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

    let rectangles = svg.append('g').selectAll('rect').data(dataset).enter();

    //Draws rectangles
    let rectBars = rectangles
      .append('rect')
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('height', 6)
      .attr('stroke', 'none')
      .attr('fill', barColor)
      .style('cursor', 'pointer')
      .on("click", d => {
        onClickCallback(d);
      })
      .attr('x', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let pos = this.chartState.xScale(medStartDate);
        return pos < 0 ? 0 : pos - 1;
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
        let barWidth = 0;
        if (medStartDate >= timelineMinDate) {
          barWidth = this.chartState.xScale(medEndDate) - this.chartState.xScale(medStartDate);
        }
        else {
          barWidth = this.chartState.xScale(medEndDate) - this.chartState.xScale(this.chartState.xDomain.currentMinValue);
        }
        return barWidth <= 0 ? 2 : barWidth;
      });


    //Draws labels
    let labels = rectangles
      .append('text')
      .attr('class', containterId + '_text')
      //.text((d, i) => this.getShortenedName(d.name))
      .text((d, i) => d.name)
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .attr('text-height', 40)
      .attr('fill', 'black')
      .style('text-transform', 'capitalize')
      .style('cursor', 'pointer')
      .on("click", d => {
        onClickCallback(d);
      })
      .attr('x', d => {
        let medStartDate = Date.parse(d.date.medStart || d.date.orderDate);
        let medEndDate = this.getEndDate(d.date.medEnd);
        let width = this.chartState.xScale(medEndDate) - this.chartState.xScale(medStartDate);
        let pos = this.chartState.xScale(medStartDate);
        if (pos < 0) {
          return 0;
        }
        else if (pos >= this.chartsWidth) {
          return this.chartsWidth;// - 20;
        }
        else {
          return pos;
        }
      })
      .attr('y', function (d: any, i) {
        for (let j = 0; j < groups.length; j++) {
          if (d.medication.id == groups[j]) {
            return j * 27 + 8;
          }
        }
      });

    this.markOverlaps(rectBars, rectangles, overlapColor);
    this.arrangeLabels(labels);

    //Adjusts height
    d3.select('#' + containterId).attr('height', groups.length * 30);
    d3.select('#' + containterId).style('display', 'block');
  }

  arrangeLabels(labels) {
    let yPositionsAll = [];
    labels.each((dCurrent, i, currentNodes) => {
      yPositionsAll.push(parseFloat(currentNodes[i].getAttribute('y')));
    });

    let yPositions = yPositionsAll.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

    yPositions.forEach(pos => {
      let tempItems = [];
      labels.each((node, i, currentNodes) => {
        let current = currentNodes[i];
        let yPos = parseFloat(current.getAttribute('y'));
        if (pos == yPos) {
          tempItems.push(current);
        }
      });
      tempItems.forEach((node, i, currentNodes) => {
        if (i != tempItems.length - 1) {
          let current = currentNodes[i];
          let txt = current.textContent;
          current.setAttribute('visibility', 'hidden');
        }
      });
    });
  }

  markOverlaps(rectBars, rectangles, overlapColor) {
    rectBars.each((d1, i, currentNodes) => {
      const current = currentNodes[i];
      let x1 = parseFloat(current.getAttribute("x"));
      let y1 = parseFloat(current.getAttribute("y"));
      let width1 = parseFloat(current.getAttribute("width"));

      rectBars.each((d2, j, nextNodes) => {
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
          }
          else if (x1 > x2 && (x2 + width2) == x1 && y1 == y2) {
            let x = x1;
            let y = y1;
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
