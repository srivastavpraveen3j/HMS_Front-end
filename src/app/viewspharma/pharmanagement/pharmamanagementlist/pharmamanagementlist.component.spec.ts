import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmamanagementlistComponent } from './pharmamanagementlist.component';

describe('PharmamanagementlistComponent', () => {
  let component: PharmamanagementlistComponent;
  let fixture: ComponentFixture<PharmamanagementlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmamanagementlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmamanagementlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
