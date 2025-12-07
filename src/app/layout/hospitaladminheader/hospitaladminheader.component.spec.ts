import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitaladminheaderComponent } from './hospitaladminheader.component';

describe('HospitaladminheaderComponent', () => {
  let component: HospitaladminheaderComponent;
  let fixture: ComponentFixture<HospitaladminheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitaladminheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitaladminheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
