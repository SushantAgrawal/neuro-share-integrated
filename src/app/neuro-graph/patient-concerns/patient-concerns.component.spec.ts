import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConcernsComponent } from './patient-concerns.component';

describe('PatientConcernsComponent', () => {
  let component: PatientConcernsComponent;
  let fixture: ComponentFixture<PatientConcernsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientConcernsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientConcernsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
