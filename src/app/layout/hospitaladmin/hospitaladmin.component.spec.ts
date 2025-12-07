import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitaladminComponent } from './hospitaladmin.component';

describe('HospitaladminComponent', () => {
  let component: HospitaladminComponent;
  let fixture: ComponentFixture<HospitaladminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitaladminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitaladminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
