import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathotestmasterlistComponent } from './pathotestmasterlist.component';

describe('PathotestmasterlistComponent', () => {
  let component: PathotestmasterlistComponent;
  let fixture: ComponentFixture<PathotestmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathotestmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathotestmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
