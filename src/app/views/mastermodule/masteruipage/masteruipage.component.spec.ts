import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasteruipageComponent } from './masteruipage.component';

describe('MasteruipageComponent', () => {
  let component: MasteruipageComponent;
  let fixture: ComponentFixture<MasteruipageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasteruipageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasteruipageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
