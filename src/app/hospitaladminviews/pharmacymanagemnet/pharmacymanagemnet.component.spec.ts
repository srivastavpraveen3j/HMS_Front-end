import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacymanagemnetComponent } from './pharmacymanagemnet.component';

describe('PharmacymanagemnetComponent', () => {
  let component: PharmacymanagemnetComponent;
  let fixture: ComponentFixture<PharmacymanagemnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacymanagemnetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacymanagemnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
