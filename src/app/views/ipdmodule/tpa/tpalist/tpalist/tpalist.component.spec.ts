import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpalistComponent } from './tpalist.component';

describe('TpalistComponent', () => {
  let component: TpalistComponent;
  let fixture: ComponentFixture<TpalistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpalistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TpalistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
