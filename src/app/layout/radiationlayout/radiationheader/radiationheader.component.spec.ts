import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiationheaderComponent } from './radiationheader.component';

describe('RadiationheaderComponent', () => {
  let component: RadiationheaderComponent;
  let fixture: ComponentFixture<RadiationheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiationheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiationheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
