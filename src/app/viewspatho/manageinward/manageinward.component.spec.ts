import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageinwardComponent } from './manageinward.component';

describe('ManageinwardComponent', () => {
  let component: ManageinwardComponent;
  let fixture: ComponentFixture<ManageinwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageinwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageinwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
