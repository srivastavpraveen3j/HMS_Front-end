import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaltestgrouplistComponent } from './medicaltestgrouplist.component';

describe('MedicaltestgrouplistComponent', () => {
  let component: MedicaltestgrouplistComponent;
  let fixture: ComponentFixture<MedicaltestgrouplistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaltestgrouplistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicaltestgrouplistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
