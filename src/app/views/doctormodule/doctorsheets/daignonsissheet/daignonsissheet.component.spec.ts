import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaignonsissheetComponent } from './daignonsissheet.component';

describe('DaignonsissheetComponent', () => {
  let component: DaignonsissheetComponent;
  let fixture: ComponentFixture<DaignonsissheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaignonsissheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaignonsissheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
