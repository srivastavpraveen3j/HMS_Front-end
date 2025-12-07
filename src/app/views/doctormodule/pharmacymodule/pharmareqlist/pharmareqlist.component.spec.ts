import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmareqlistComponent } from './pharmareqlist.component';

describe('PharmareqlistComponent', () => {
  let component: PharmareqlistComponent;
  let fixture: ComponentFixture<PharmareqlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmareqlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmareqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
