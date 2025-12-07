import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomtransferComponent } from './roomtransfer.component';

describe('RoomtransferComponent', () => {
  let component: RoomtransferComponent;
  let fixture: ComponentFixture<RoomtransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomtransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomtransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
