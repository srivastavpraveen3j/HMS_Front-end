import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosislistComponent } from './diagnosislist.component';

describe('DiagnosislistComponent', () => {
  let component: DiagnosislistComponent;
  let fixture: ComponentFixture<DiagnosislistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosislistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosislistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
