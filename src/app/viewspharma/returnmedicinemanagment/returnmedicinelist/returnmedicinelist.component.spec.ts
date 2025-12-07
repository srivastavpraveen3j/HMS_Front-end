import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnmedicinelistComponent } from './returnmedicinelist.component';

describe('ReturnmedicinelistComponent', () => {
  let component: ReturnmedicinelistComponent;
  let fixture: ComponentFixture<ReturnmedicinelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnmedicinelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnmedicinelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
