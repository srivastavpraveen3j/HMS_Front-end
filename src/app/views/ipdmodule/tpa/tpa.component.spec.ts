import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpaComponent } from './tpa.component';

describe('TpaComponent', () => {
  let component: TpaComponent;
  let fixture: ComponentFixture<TpaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TpaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
