import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdcasesComponent } from './opdcases.component';

describe('OpdcasesComponent', () => {
  let component: OpdcasesComponent;
  let fixture: ComponentFixture<OpdcasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdcasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdcasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
