import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomWiseOccupancyComponent } from './room-wise-occupancy.component';

describe('RoomWiseOccupancyComponent', () => {
  let component: RoomWiseOccupancyComponent;
  let fixture: ComponentFixture<RoomWiseOccupancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomWiseOccupancyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomWiseOccupancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
