import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdpatientsummaryComponent } from './ipdpatientsummary.component';

describe('IpdpatientsummaryComponent', () => {
  let component: IpdpatientsummaryComponent;
  let fixture: ComponentFixture<IpdpatientsummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdpatientsummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdpatientsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
