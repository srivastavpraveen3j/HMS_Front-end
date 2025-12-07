import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentlistComponent } from './treatmentlist.component';

describe('TreatmentlistComponent', () => {
  let component: TreatmentlistComponent;
  let fixture: ComponentFixture<TreatmentlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
