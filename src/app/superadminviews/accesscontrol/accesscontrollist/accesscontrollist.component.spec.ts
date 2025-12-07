import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesscontrollistComponent } from './accesscontrollist.component';

describe('AccesscontrollistComponent', () => {
  let component: AccesscontrollistComponent;
  let fixture: ComponentFixture<AccesscontrollistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesscontrollistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesscontrollistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
