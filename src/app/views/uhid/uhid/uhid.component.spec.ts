import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UhidComponent } from './uhid.component';

describe('UhidComponent', () => {
  let component: UhidComponent;
  let fixture: ComponentFixture<UhidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UhidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UhidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
