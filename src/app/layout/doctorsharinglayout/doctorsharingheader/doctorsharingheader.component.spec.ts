import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsharingheaderComponent } from './doctorsharingheader.component';

describe('DoctorsharingheaderComponent', () => {
  let component: DoctorsharingheaderComponent;
  let fixture: ComponentFixture<DoctorsharingheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsharingheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorsharingheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
