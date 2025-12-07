import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugerpanelComponent } from './debugerpanel.component';

describe('DebugerpanelComponent', () => {
  let component: DebugerpanelComponent;
  let fixture: ComponentFixture<DebugerpanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugerpanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugerpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
