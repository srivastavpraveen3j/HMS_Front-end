import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockheaderComponent } from './stockheader.component';

describe('StockheaderComponent', () => {
  let component: StockheaderComponent;
  let fixture: ComponentFixture<StockheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
