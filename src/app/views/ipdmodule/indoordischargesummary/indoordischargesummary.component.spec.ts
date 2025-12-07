import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndoordischargesummaryComponent } from './indoordischargesummary.component';

describe('IndoordischargesummaryComponent', () => {
  let component: IndoordischargesummaryComponent;
  let fixture: ComponentFixture<IndoordischargesummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndoordischargesummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndoordischargesummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
