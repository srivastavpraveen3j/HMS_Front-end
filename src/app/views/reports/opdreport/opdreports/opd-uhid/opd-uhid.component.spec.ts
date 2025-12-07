import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdUhidComponent } from './opd-uhid.component';

describe('OpdUhidComponent', () => {
  let component: OpdUhidComponent;
  let fixture: ComponentFixture<OpdUhidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdUhidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdUhidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
