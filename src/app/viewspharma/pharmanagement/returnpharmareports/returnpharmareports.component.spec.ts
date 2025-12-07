import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnpharmareportsComponent } from './returnpharmareports.component';

describe('ReturnpharmareportsComponent', () => {
  let component: ReturnpharmareportsComponent;
  let fixture: ComponentFixture<ReturnpharmareportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnpharmareportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnpharmareportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
