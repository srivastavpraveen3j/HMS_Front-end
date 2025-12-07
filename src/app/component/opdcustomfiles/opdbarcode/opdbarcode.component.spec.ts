import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdbarcodeComponent } from './opdbarcode.component';

describe('OpdbarcodeComponent', () => {
  let component: OpdbarcodeComponent;
  let fixture: ComponentFixture<OpdbarcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdbarcodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdbarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
