import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmareportComponent } from './pharmareport.component';

describe('PharmareportComponent', () => {
  let component: PharmareportComponent;
  let fixture: ComponentFixture<PharmareportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmareportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmareportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
