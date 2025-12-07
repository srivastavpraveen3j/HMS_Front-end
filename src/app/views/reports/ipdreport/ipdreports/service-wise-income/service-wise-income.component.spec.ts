import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceWiseIncomeComponent } from './service-wise-income.component';

describe('ServiceWiseIncomeComponent', () => {
  let component: ServiceWiseIncomeComponent;
  let fixture: ComponentFixture<ServiceWiseIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceWiseIncomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceWiseIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
