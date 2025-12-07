import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminplatformusersComponent } from './superadminplatformusers.component';

describe('SuperadminplatformusersComponent', () => {
  let component: SuperadminplatformusersComponent;
  let fixture: ComponentFixture<SuperadminplatformusersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperadminplatformusersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminplatformusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
