import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasteripdchargrComponent } from './masteripdchargr.component';

describe('MasteripdchargrComponent', () => {
  let component: MasteripdchargrComponent;
  let fixture: ComponentFixture<MasteripdchargrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasteripdchargrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasteripdchargrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
