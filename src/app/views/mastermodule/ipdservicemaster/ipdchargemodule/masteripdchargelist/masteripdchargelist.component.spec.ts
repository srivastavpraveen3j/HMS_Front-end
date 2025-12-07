import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasteripdchargelistComponent } from './masteripdchargelist.component';

describe('MasteripdchargelistComponent', () => {
  let component: MasteripdchargelistComponent;
  let fixture: ComponentFixture<MasteripdchargelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasteripdchargelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasteripdchargelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
