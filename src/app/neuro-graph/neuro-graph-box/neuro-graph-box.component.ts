import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
// import {envs} from '../../app.config'; import {allMessages, allHttpMessages,
// manyHttpMessages} from '../neuro-graph.config'; import {BrokerService} from
// '../broker/broker.service'; import {NeuroGraphService} from
// '../neuro-graph.service'; changeDetection is important
@Component({changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-neuro-graph-box', templateUrl: './neuro-graph-box.component.html', styleUrls: ['./neuro-graph-box.component.scss'], encapsulation: ViewEncapsulation.None})
export class NeuroGraphBoxComponent {

  constructor() {}

}
