import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorreferralruleComponent } from './doctorreferralrule.component';

describe('DoctorreferralruleComponent', () => {
  let component: DoctorreferralruleComponent;
  let fixture: ComponentFixture<DoctorreferralruleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorreferralruleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorreferralruleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
