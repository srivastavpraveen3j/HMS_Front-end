import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomwardComponent } from './customward.component';

describe('CustomwardComponent', () => {
  let component: CustomwardComponent;
  let fixture: ComponentFixture<CustomwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
