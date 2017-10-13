import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

@Component({changeDetection: ChangeDetectionStrategy.OnPush, selector: 'app-neuro-graph-box', templateUrl: './neuro-graph-box.component.html', styleUrls: ['./neuro-graph-box.component.scss'], encapsulation: ViewEncapsulation.None})
export class NeuroGraphBoxComponent {

  constructor() {}

}
