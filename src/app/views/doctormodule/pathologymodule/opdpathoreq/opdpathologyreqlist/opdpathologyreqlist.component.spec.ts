import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdpathologyreqlistComponent } from './opdpathologyreqlist.component';

describe('OpdpathologyreqlistComponent', () => {
  let component: OpdpathologyreqlistComponent;
  let fixture: ComponentFixture<OpdpathologyreqlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdpathologyreqlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdpathologyreqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
