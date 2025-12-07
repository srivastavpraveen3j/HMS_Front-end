import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestmastergroupComponent } from './testmastergroup.component';

describe('TestmastergroupComponent', () => {
  let component: TestmastergroupComponent;
  let fixture: ComponentFixture<TestmastergroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestmastergroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestmastergroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
