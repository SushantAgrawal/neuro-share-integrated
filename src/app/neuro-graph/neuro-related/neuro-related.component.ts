import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BrokerService } from '../broker/broker.service';
// import { BrokerService } from '../../broker/broker.module';
// import {BrokerService} from 'broker';
import { allMessages, allHttpMessages, manyHttpMessages } from '../neuro-graph.config';
import { MdDialog } from '@angular/material';
import { RelapsesComponent } from '../graph-panel/relapses/relapses.component';


@Component({
  selector: 'app-neuro-related',
  templateUrl: './neuro-related.component.html',
  styleUrls: ['./neuro-related.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NeuroRelatedComponent implements OnInit {
  display: Boolean = false;
  constructor(private brokerService: BrokerService, public dialog: MdDialog) { }

  ngOnInit() {
    console.log('neuro-related ngOnInit');    
  }

  ngAfterViewInit(){
    console.log('neuro-related anAfterViewInit');
    this
    .brokerService
    .emit(allMessages.neuroRelated, {
      artifact: 'dmt',
      checked: true
    });
  this
    .brokerService
    .emit(allMessages.neuroRelated, {
      artifact: 'edss',
      checked: true
    });
  this
    .brokerService
    .emit(allMessages.neuroRelated, {
      artifact: 'labs',
      checked: true
    });
  };

  changed(e, value) {
    this
      .brokerService
      .emit(allMessages.neuroRelated, {
        artifact: value,
        checked: e.checked
      });
  }

  openDialog(type) {
    switch (type) {
      case 'relapses':
        this.brokerService.emit(allMessages.invokeAddRelapses);
        break;
      case 'edss':
        this.brokerService.emit(allMessages.invokeAddEdss);
        break;
      default:
    }
  }
}
