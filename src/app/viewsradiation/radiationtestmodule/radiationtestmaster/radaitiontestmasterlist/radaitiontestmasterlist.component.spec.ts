import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadaitiontestmasterlistComponent } from './radaitiontestmasterlist.component';

describe('RadaitiontestmasterlistComponent', () => {
  let component: RadaitiontestmasterlistComponent;
  let fixture: ComponentFixture<RadaitiontestmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadaitiontestmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadaitiontestmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
