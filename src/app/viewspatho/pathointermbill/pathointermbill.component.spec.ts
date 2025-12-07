import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathointermbillComponent } from './pathointermbill.component';

describe('PathointermbillComponent', () => {
  let component: PathointermbillComponent;
  let fixture: ComponentFixture<PathointermbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathointermbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathointermbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
