import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdpathologyreqComponent } from './opdpathologyreq.component';

describe('OpdpathologyreqComponent', () => {
  let component: OpdpathologyreqComponent;
  let fixture: ComponentFixture<OpdpathologyreqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdpathologyreqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdpathologyreqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
