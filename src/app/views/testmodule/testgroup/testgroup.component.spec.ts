import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestgroupComponent } from './testgroup.component';

describe('TestgroupComponent', () => {
  let component: TestgroupComponent;
  let fixture: ComponentFixture<TestgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestgroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
