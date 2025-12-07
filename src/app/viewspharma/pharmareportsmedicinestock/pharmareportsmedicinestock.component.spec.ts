import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmareportsmedicinestockComponent } from './pharmareportsmedicinestock.component';

describe('PharmareportsmedicinestockComponent', () => {
  let component: PharmareportsmedicinestockComponent;
  let fixture: ComponentFixture<PharmareportsmedicinestockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmareportsmedicinestockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmareportsmedicinestockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
