import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdpatientdetailsComponent } from './opdpatientdetails.component';

describe('OpdpatientdetailsComponent', () => {
  let component: OpdpatientdetailsComponent;
  let fixture: ComponentFixture<OpdpatientdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdpatientdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdpatientdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
