import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuemanagementComponent } from './quemanagement.component';

describe('QuemanagementComponent', () => {
  let component: QuemanagementComponent;
  let fixture: ComponentFixture<QuemanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuemanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuemanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
