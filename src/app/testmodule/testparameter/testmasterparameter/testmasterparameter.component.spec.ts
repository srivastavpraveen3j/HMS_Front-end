import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestmasterparameterComponent } from './testmasterparameter.component';

describe('TestmasterparameterComponent', () => {
  let component: TestmasterparameterComponent;
  let fixture: ComponentFixture<TestmasterparameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestmasterparameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestmasterparameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
