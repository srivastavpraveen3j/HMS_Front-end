import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmaintermbillComponent } from './pharmaintermbill.component';

describe('PharmaintermbillComponent', () => {
  let component: PharmaintermbillComponent;
  let fixture: ComponentFixture<PharmaintermbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmaintermbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmaintermbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
