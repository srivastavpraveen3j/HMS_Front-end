import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdmasterComponent } from './opdmaster.component';

describe('OpdmasterComponent', () => {
  let component: OpdmasterComponent;
  let fixture: ComponentFixture<OpdmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
