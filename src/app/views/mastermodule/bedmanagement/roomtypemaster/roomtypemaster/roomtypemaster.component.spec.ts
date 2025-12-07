import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomtypemasterComponent } from './roomtypemaster.component';

describe('RoomtypemasterComponent', () => {
  let component: RoomtypemasterComponent;
  let fixture: ComponentFixture<RoomtypemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomtypemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomtypemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
