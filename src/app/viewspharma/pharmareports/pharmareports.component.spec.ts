import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmareportsComponent } from './pharmareports.component';

describe('PharmareportsComponent', () => {
  let component: PharmareportsComponent;
  let fixture: ComponentFixture<PharmareportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmareportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmareportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
