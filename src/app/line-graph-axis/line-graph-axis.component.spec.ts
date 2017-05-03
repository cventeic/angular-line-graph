import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineGraphAxisComponent } from './line-graph-axis.component';

describe('LineGraphAxisComponent', () => {
  let component: LineGraphAxisComponent;
  let fixture: ComponentFixture<LineGraphAxisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineGraphAxisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineGraphAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
