import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndoorpatientsummaryComponent } from './indoorpatientsummary.component';

describe('IndoorpatientsummaryComponent', () => {
  let component: IndoorpatientsummaryComponent;
  let fixture: ComponentFixture<IndoorpatientsummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndoorpatientsummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndoorpatientsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
