import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntermbillComponent } from './intermbill.component';

describe('IntermbillComponent', () => {
  let component: IntermbillComponent;
  let fixture: ComponentFixture<IntermbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntermbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntermbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
