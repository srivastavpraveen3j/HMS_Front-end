import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomchargecalculationComponent } from './roomchargecalculation.component';

describe('RoomchargecalculationComponent', () => {
  let component: RoomchargecalculationComponent;
  let fixture: ComponentFixture<RoomchargecalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomchargecalculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomchargecalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
