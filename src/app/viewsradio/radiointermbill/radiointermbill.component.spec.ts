import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiointermbillComponent } from './radiointermbill.component';

describe('RadiointermbillComponent', () => {
  let component: RadiointermbillComponent;
  let fixture: ComponentFixture<RadiointermbillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiointermbillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiointermbillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
