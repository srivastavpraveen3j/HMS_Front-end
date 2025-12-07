import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaltestgroupComponent } from './medicaltestgroup.component';

describe('MedicaltestgroupComponent', () => {
  let component: MedicaltestgroupComponent;
  let fixture: ComponentFixture<MedicaltestgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaltestgroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicaltestgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
