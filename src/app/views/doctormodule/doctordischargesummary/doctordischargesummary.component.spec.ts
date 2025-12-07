import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctordischargesummaryComponent } from './doctordischargesummary.component';

describe('DoctordischargesummaryComponent', () => {
  let component: DoctordischargesummaryComponent;
  let fixture: ComponentFixture<DoctordischargesummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctordischargesummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctordischargesummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
