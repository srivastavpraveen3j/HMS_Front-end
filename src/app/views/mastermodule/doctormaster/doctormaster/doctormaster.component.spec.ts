import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctormasterComponent } from './doctormaster.component';

describe('DoctormasterComponent', () => {
  let component: DoctormasterComponent;
  let fixture: ComponentFixture<DoctormasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctormasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctormasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
