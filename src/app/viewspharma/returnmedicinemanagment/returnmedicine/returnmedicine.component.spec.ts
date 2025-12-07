import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnmedicineComponent } from './returnmedicine.component';

describe('ReturnmedicineComponent', () => {
  let component: ReturnmedicineComponent;
  let fixture: ComponentFixture<ReturnmedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnmedicineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnmedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
