import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoheaderComponent } from './pathoheader.component';

describe('PathoheaderComponent', () => {
  let component: PathoheaderComponent;
  let fixture: ComponentFixture<PathoheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
