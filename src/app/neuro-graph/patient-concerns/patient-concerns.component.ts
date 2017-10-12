import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-patient-concerns',
  templateUrl: './patient-concerns.component.html',
  styleUrls: ['./patient-concerns.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class PatientConcernsComponent implements OnInit {
  constructor() { }
  tiles = [
    { text: 'One', cols: 3, rows: 1, color: 'lightblue' },
    { text: 'Two', cols: 1, rows: 2, color: 'lightgreen' },
    { text: 'Three', cols: 1, rows: 1, color: 'lightpink' },
    { text: 'Four', cols: 2, rows: 1, color: '#DDBDF1' },
  ];
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
  
  ngOnInit() {
  }

}
