import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmareportswalkinComponent } from './pharmareportswalkin.component';

describe('PharmareportswalkinComponent', () => {
  let component: PharmareportswalkinComponent;
  let fixture: ComponentFixture<PharmareportswalkinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmareportswalkinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmareportswalkinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
