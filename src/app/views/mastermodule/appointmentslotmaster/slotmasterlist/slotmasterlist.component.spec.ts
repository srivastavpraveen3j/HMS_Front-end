import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotmasterlistComponent } from './slotmasterlist.component';

describe('SlotmasterlistComponent', () => {
  let component: SlotmasterlistComponent;
  let fixture: ComponentFixture<SlotmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
