import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmamanageinwardComponent } from './pharmamanageinward.component';

describe('PharmamanageinwardComponent', () => {
  let component: PharmamanageinwardComponent;
  let fixture: ComponentFixture<PharmamanageinwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmamanageinwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmamanageinwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
