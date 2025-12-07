import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdadmissionComponent } from './ipdadmission.component';

describe('IpdadmissionComponent', () => {
  let component: IpdadmissionComponent;
  let fixture: ComponentFixture<IpdadmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdadmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdadmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
