import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadaitiontestmasterComponent } from './radaitiontestmaster.component';

describe('RadaitiontestmasterComponent', () => {
  let component: RadaitiontestmasterComponent;
  let fixture: ComponentFixture<RadaitiontestmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadaitiontestmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadaitiontestmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
