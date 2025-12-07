import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietchartComponent } from './dietchart.component';

describe('DietchartComponent', () => {
  let component: DietchartComponent;
  let fixture: ComponentFixture<DietchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietchartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
