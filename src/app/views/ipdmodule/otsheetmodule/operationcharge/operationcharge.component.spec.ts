import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationchargeComponent } from './operationcharge.component';

describe('OperationchargeComponent', () => {
  let component: OperationchargeComponent;
  let fixture: ComponentFixture<OperationchargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationchargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationchargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
