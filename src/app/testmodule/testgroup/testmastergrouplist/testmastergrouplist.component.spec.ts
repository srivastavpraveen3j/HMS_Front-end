import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestmastergrouplistComponent } from './testmastergrouplist.component';

describe('TestmastergrouplistComponent', () => {
  let component: TestmastergrouplistComponent;
  let fixture: ComponentFixture<TestmastergrouplistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestmastergrouplistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestmastergrouplistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
