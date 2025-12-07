import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationintermbillComponent } from './radiationintermbill.component';

describe('RadiationintermbillComponent', () => {
  let component: RadiationintermbillComponent;
  let fixture: ComponentFixture<RadiationintermbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationintermbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationintermbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
