import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdbilllistComponent } from './opdbilllist.component';

describe('OpdbilllistComponent', () => {
  let component: OpdbilllistComponent;
  let fixture: ComponentFixture<OpdbilllistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdbilllistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdbilllistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
