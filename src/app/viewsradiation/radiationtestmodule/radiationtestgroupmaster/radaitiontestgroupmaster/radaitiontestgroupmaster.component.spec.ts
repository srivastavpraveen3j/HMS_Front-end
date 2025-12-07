import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadaitiontestgroupmasterComponent } from './radaitiontestgroupmaster.component';

describe('RadaitiontestgroupmasterComponent', () => {
  let component: RadaitiontestgroupmasterComponent;
  let fixture: ComponentFixture<RadaitiontestgroupmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadaitiontestgroupmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadaitiontestgroupmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
