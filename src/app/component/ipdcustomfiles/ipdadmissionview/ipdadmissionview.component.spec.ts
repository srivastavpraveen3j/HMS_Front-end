import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpdadmissionviewComponent } from './ipdadmissionview.component';

describe('IpdadmissionviewComponent', () => {
  let component: IpdadmissionviewComponent;
  let fixture: ComponentFixture<IpdadmissionviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdadmissionviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpdadmissionviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
