import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitaladminuiComponent } from './hospitaladminui.component';

describe('HospitaladminuiComponent', () => {
  let component: HospitaladminuiComponent;
  let fixture: ComponentFixture<HospitaladminuiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitaladminuiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitaladminuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
