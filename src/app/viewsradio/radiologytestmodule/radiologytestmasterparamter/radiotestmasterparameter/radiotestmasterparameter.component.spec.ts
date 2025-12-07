import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiotestmasterparameterComponent } from './radiotestmasterparameter.component';

describe('RadiotestmasterparameterComponent', () => {
  let component: RadiotestmasterparameterComponent;
  let fixture: ComponentFixture<RadiotestmasterparameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiotestmasterparameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiotestmasterparameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
