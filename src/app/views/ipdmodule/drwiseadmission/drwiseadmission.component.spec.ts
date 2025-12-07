import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrwiseadmissionComponent } from './drwiseadmission.component';

describe('DrwiseadmissionComponent', () => {
  let component: DrwiseadmissionComponent;
  let fixture: ComponentFixture<DrwiseadmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrwiseadmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrwiseadmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
