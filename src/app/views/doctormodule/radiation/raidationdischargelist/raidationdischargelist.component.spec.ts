import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaidationdischargelistComponent } from './raidationdischargelist.component';

describe('RaidationdischargelistComponent', () => {
  let component: RaidationdischargelistComponent;
  let fixture: ComponentFixture<RaidationdischargelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaidationdischargelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaidationdischargelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
