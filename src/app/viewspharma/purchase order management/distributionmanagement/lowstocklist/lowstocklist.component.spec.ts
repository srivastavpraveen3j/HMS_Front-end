import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowstocklistComponent } from './lowstocklist.component';

describe('LowstocklistComponent', () => {
  let component: LowstocklistComponent;
  let fixture: ComponentFixture<LowstocklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowstocklistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowstocklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
