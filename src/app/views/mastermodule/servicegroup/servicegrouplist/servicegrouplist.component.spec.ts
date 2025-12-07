import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicegrouplistComponent } from './servicegrouplist.component';

describe('ServicegrouplistComponent', () => {
  let component: ServicegrouplistComponent;
  let fixture: ComponentFixture<ServicegrouplistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicegrouplistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicegrouplistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
