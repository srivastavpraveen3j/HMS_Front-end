import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentordersheetComponent } from './treatmentordersheet.component';

describe('TreatmentordersheetComponent', () => {
  let component: TreatmentordersheetComponent;
  let fixture: ComponentFixture<TreatmentordersheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentordersheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentordersheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
