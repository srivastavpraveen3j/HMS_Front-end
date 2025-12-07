import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationreportsComponent } from './radiationreports.component';

describe('RadiationreportsComponent', () => {
  let component: RadiationreportsComponent;
  let fixture: ComponentFixture<RadiationreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationreportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
