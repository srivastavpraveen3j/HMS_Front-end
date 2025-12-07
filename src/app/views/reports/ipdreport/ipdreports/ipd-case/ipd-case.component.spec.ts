import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdCaseComponent } from './ipd-case.component';

describe('IpdCaseComponent', () => {
  let component: IpdCaseComponent;
  let fixture: ComponentFixture<IpdCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdCaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
