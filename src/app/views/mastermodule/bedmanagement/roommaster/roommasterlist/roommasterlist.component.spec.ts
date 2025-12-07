import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoommasterlistComponent } from './roommasterlist.component';

describe('RoommasterlistComponent', () => {
  let component: RoommasterlistComponent;
  let fixture: ComponentFixture<RoommasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoommasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoommasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
