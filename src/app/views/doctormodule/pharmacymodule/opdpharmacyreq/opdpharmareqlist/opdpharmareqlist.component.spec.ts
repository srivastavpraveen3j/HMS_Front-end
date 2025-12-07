import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdpharmareqlistComponent } from './opdpharmareqlist.component';

describe('OpdpharmareqlistComponent', () => {
  let component: OpdpharmareqlistComponent;
  let fixture: ComponentFixture<OpdpharmareqlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdpharmareqlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdpharmareqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
