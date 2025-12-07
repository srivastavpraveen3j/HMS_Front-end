import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastmessagingComponent } from './broadcastmessaging.component';

describe('BroadcastmessagingComponent', () => {
  let component: BroadcastmessagingComponent;
  let fixture: ComponentFixture<BroadcastmessagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BroadcastmessagingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BroadcastmessagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
