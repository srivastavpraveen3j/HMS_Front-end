import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedpackageeComponent } from './medpackagee.component';

describe('MedpackageeComponent', () => {
  let component: MedpackageeComponent;
  let fixture: ComponentFixture<MedpackageeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedpackageeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedpackageeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
