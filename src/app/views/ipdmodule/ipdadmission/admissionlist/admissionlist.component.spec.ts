import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionlistComponent } from './admissionlist.component';

describe('AdmissionlistComponent', () => {
  let component: AdmissionlistComponent;
  let fixture: ComponentFixture<AdmissionlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
