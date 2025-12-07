import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestparameterComponent } from './testparameter.component';

describe('TestparameterComponent', () => {
  let component: TestparameterComponent;
  let fixture: ComponentFixture<TestparameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestparameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestparameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
