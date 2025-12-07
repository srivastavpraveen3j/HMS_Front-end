import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsermasterlistComponent } from './usermasterlist.component';

describe('UsermasterlistComponent', () => {
  let component: UsermasterlistComponent;
  let fixture: ComponentFixture<UsermasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsermasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsermasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
