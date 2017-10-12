import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeuroGraphBoxComponent } from './neuro-graph-box.component';

describe('NeuroGraphBoxComponent', () => {
  let component: NeuroGraphBoxComponent;
  let fixture: ComponentFixture<NeuroGraphBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeuroGraphBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeuroGraphBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
