import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrativesettingComponent } from './administrativesetting.component';

describe('AdministrativesettingComponent', () => {
  let component: AdministrativesettingComponent;
  let fixture: ComponentFixture<AdministrativesettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrativesettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrativesettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
