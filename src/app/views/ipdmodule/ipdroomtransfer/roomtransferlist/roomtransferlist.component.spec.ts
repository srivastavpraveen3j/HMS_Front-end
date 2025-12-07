import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomtransferlistComponent } from './roomtransferlist.component';

describe('RoomtransferlistComponent', () => {
  let component: RoomtransferlistComponent;
  let fixture: ComponentFixture<RoomtransferlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomtransferlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomtransferlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
