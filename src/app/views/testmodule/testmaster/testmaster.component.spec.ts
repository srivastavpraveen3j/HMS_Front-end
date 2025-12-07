import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestmasterComponent } from './testmaster.component';

describe('TestmasterComponent', () => {
  let component: TestmasterComponent;
  let fixture: ComponentFixture<TestmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
