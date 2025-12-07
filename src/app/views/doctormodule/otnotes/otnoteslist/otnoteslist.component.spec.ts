import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtnoteslistComponent } from './otnoteslist.component';

describe('OtnoteslistComponent', () => {
  let component: OtnoteslistComponent;
  let fixture: ComponentFixture<OtnoteslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtnoteslistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtnoteslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
