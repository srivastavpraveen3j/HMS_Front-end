import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralsettingComponent } from './generalsetting.component';

describe('GeneralsettingComponent', () => {
  let component: GeneralsettingComponent;
  let fixture: ComponentFixture<GeneralsettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralsettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
