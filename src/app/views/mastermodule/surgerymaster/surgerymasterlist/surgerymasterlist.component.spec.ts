import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgerymasterlistComponent } from './surgerymasterlist.component';

describe('SurgerymasterlistComponent', () => {
  let component: SurgerymasterlistComponent;
  let fixture: ComponentFixture<SurgerymasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurgerymasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgerymasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
