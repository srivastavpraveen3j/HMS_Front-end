import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmareportsipdComponent } from './pharmareportsipd.component';

describe('PharmareportsipdComponent', () => {
  let component: PharmareportsipdComponent;
  let fixture: ComponentFixture<PharmareportsipdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmareportsipdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmareportsipdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
