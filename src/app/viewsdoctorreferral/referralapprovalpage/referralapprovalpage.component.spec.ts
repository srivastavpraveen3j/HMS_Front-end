import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralapprovalpageComponent } from './referralapprovalpage.component';

describe('ReferralapprovalpageComponent', () => {
  let component: ReferralapprovalpageComponent;
  let fixture: ComponentFixture<ReferralapprovalpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralapprovalpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralapprovalpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
