import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorreferralrulelistComponent } from './doctorreferralrulelist.component';

describe('DoctorreferralrulelistComponent', () => {
  let component: DoctorreferralrulelistComponent;
  let fixture: ComponentFixture<DoctorreferralrulelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorreferralrulelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorreferralrulelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
