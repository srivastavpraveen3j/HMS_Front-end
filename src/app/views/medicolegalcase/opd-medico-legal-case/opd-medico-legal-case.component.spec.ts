import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdMedicoLegalCaseComponent } from './opd-medico-legal-case.component';

describe('OpdMedicoLegalCaseComponent', () => {
  let component: OpdMedicoLegalCaseComponent;
  let fixture: ComponentFixture<OpdMedicoLegalCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdMedicoLegalCaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdMedicoLegalCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
