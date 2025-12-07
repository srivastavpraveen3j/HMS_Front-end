import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmaheaderComponent } from './pharmaheader.component';

describe('PharmaheaderComponent', () => {
  let component: PharmaheaderComponent;
  let fixture: ComponentFixture<PharmaheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmaheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmaheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
