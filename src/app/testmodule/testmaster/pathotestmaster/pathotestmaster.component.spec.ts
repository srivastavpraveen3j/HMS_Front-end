import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathotestmasterComponent } from './pathotestmaster.component';

describe('PathotestmasterComponent', () => {
  let component: PathotestmasterComponent;
  let fixture: ComponentFixture<PathotestmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathotestmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathotestmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
