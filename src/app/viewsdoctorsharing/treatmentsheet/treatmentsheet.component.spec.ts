import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentsheetComponent } from './treatmentsheet.component';

describe('TreatmentsheetComponent', () => {
  let component: TreatmentsheetComponent;
  let fixture: ComponentFixture<TreatmentsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentsheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
