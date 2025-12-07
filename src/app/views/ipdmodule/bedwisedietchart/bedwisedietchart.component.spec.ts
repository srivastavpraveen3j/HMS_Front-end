import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedwisedietchartComponent } from './bedwisedietchart.component';

describe('BedwisedietchartComponent', () => {
  let component: BedwisedietchartComponent;
  let fixture: ComponentFixture<BedwisedietchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedwisedietchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedwisedietchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
