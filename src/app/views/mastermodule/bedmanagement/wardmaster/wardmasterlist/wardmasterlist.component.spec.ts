import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WardmasterlistComponent } from './wardmasterlist.component';

describe('WardmasterlistComponent', () => {
  let component: WardmasterlistComponent;
  let fixture: ComponentFixture<WardmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WardmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
