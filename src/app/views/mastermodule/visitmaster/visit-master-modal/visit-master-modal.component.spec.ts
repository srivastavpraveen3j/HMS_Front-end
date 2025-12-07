import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitMasterModalComponent } from './visit-master-modal.component';

describe('VisitMasterModalComponent', () => {
  let component: VisitMasterModalComponent;
  let fixture: ComponentFixture<VisitMasterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitMasterModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitMasterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
