import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorreferralheaderComponent } from './doctorreferralheader.component';

describe('DoctorreferralheaderComponent', () => {
  let component: DoctorreferralheaderComponent;
  let fixture: ComponentFixture<DoctorreferralheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorreferralheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorreferralheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
