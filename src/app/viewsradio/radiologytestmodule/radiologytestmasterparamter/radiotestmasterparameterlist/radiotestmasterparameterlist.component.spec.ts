import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiotestmasterparameterlistComponent } from './radiotestmasterparameterlist.component';

describe('RadiotestmasterparameterlistComponent', () => {
  let component: RadiotestmasterparameterlistComponent;
  let fixture: ComponentFixture<RadiotestmasterparameterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiotestmasterparameterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiotestmasterparameterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
