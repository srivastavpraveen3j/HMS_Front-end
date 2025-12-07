import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaidationdischargeComponent } from './raidationdischarge.component';

describe('RaidationdischargeComponent', () => {
  let component: RaidationdischargeComponent;
  let fixture: ComponentFixture<RaidationdischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaidationdischargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaidationdischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
