import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {BrokerService} from '../broker/broker.service';
import {allMessages, allHttpMessages, manyHttpMessages} from '../neuro-graph.config';
// import {RelapsesComponent} from '../graph-panel/relapses/relapses.component';
import {EvalService} from '@sutterhealth/analytics';

@Component({selector: 'app-neuro-related', templateUrl: './neuro-related.component.html', styleUrls: ['./neuro-related.component.scss'], encapsulation: ViewEncapsulation.None})
export class NeuroRelatedComponent implements OnInit {
<<<<<<< HEAD
  display : Boolean = false;
  constructor(private evalService : EvalService, private brokerService : BrokerService) {}

  ngOnInit() {}
=======
  display: Boolean = false;
  checkDMT:Boolean = true;
  constructor(private brokerService: BrokerService, public dialog: MdDialog) { }

  ngOnInit() { 
    let dmt = this
    .brokerService
    .filterOn(allMessages.neuroRelated)
    .filter(t => (t.data.artifact == 'dmt'));
    
    let sub1 = dmt
    .filter(t => t.data.checked)
    .subscribe(d => {
      d.error
        ? console.log(d.error)
        : (() => {
          //make api call
          this.checkDMT=true;
        })();
    });
  }
>>>>>>> 61a30e31f4019e5849112a5cc1eb30cb094068fb

  ngAfterViewInit() {    
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
    let evalData = {
      label: value,
      data: e.checked,
      type: 'checkbox'
    };
    this
      .evalService
      .sendEvent(evalData);
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
        this
          .brokerService
          .emit(allMessages.invokeAddRelapses);
        break;
      case 'edss':
        this
          .brokerService
          .emit(allMessages.invokeAddEdss);
        break;
      case 'walk25Feet':
        this
          .brokerService
          .emit(allMessages.invokeAddWalk25Feet);
        break;
      default:
    }
  }
}
