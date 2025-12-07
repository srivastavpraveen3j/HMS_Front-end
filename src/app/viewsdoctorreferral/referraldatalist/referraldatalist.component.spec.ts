import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferraldatalistComponent } from './referraldatalist.component';

describe('ReferraldatalistComponent', () => {
  let component: ReferraldatalistComponent;
  let fixture: ComponentFixture<ReferraldatalistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferraldatalistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferraldatalistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
