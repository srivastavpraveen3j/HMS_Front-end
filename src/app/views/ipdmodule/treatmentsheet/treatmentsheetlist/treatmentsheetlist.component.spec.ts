import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentsheetlistComponent } from './treatmentsheetlist.component';

describe('TreatmentsheetlistComponent', () => {
  let component: TreatmentsheetlistComponent;
  let fixture: ComponentFixture<TreatmentsheetlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentsheetlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentsheetlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
