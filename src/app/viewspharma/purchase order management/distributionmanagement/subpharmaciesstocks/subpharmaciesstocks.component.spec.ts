import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubpharmaciesstocksComponent } from './subpharmaciesstocks.component';

describe('SubpharmaciesstocksComponent', () => {
  let component: SubpharmaciesstocksComponent;
  let fixture: ComponentFixture<SubpharmaciesstocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubpharmaciesstocksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubpharmaciesstocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
