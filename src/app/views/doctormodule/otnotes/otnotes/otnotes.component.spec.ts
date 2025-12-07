import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtnotesComponent } from './otnotes.component';

describe('OtnotesComponent', () => {
  let component: OtnotesComponent;
  let fixture: ComponentFixture<OtnotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtnotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtnotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
