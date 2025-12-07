import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpddatasharingComponent } from './opddatasharing.component';

describe('OpddatasharingComponent', () => {
  let component: OpddatasharingComponent;
  let fixture: ComponentFixture<OpddatasharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpddatasharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpddatasharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
