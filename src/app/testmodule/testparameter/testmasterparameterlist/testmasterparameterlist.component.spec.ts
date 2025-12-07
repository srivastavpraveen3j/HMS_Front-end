import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestmasterparameterlistComponent } from './testmasterparameterlist.component';

describe('TestmasterparameterlistComponent', () => {
  let component: TestmasterparameterlistComponent;
  let fixture: ComponentFixture<TestmasterparameterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestmasterparameterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestmasterparameterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
