import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastmessaginglistComponent } from './broadcastmessaginglist.component';

describe('BroadcastmessaginglistComponent', () => {
  let component: BroadcastmessaginglistComponent;
  let fixture: ComponentFixture<BroadcastmessaginglistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastmessaginglistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastmessaginglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
