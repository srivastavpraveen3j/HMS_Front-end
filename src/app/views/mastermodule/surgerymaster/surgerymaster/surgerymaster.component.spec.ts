import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgerymasterComponent } from './surgerymaster.component';

describe('SurgerymasterComponent', () => {
  let component: SurgerymasterComponent;
  let fixture: ComponentFixture<SurgerymasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurgerymasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgerymasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
