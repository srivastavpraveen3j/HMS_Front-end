import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdMedicoLegalCaseComponent } from './ipd-medico-legal-case.component';

describe('IpdMedicoLegalCaseComponent', () => {
  let component: IpdMedicoLegalCaseComponent;
  let fixture: ComponentFixture<IpdMedicoLegalCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdMedicoLegalCaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdMedicoLegalCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
