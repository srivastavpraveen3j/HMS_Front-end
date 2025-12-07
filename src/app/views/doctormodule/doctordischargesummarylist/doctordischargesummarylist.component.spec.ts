import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctordischargesummarylistComponent } from './doctordischargesummarylist.component';

describe('DoctordischargesummarylistComponent', () => {
  let component: DoctordischargesummarylistComponent;
  let fixture: ComponentFixture<DoctordischargesummarylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctordischargesummarylistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctordischargesummarylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
