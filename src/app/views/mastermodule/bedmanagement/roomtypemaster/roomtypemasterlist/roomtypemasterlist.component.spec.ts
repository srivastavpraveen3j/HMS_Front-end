import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomtypemasterlistComponent } from './roomtypemasterlist.component';

describe('RoomtypemasterlistComponent', () => {
  let component: RoomtypemasterlistComponent;
  let fixture: ComponentFixture<RoomtypemasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomtypemasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomtypemasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
