import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationlayoutComponent } from './radiationlayout.component';

describe('RadiationlayoutComponent', () => {
  let component: RadiationlayoutComponent;
  let fixture: ComponentFixture<RadiationlayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationlayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationlayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
