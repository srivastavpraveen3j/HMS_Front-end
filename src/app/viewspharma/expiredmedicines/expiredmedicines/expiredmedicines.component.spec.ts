import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredmedicinesComponent } from './expiredmedicines.component';

describe('ExpiredmedicinesComponent', () => {
  let component: ExpiredmedicinesComponent;
  let fixture: ComponentFixture<ExpiredmedicinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiredmedicinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredmedicinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
