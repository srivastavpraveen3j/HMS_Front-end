import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceWiseCollectionComponent } from './service-wise-collection.component';

describe('ServiceWiseCollectionComponent', () => {
  let component: ServiceWiseCollectionComponent;
  let fixture: ComponentFixture<ServiceWiseCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceWiseCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceWiseCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
