import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadaitiontestgroupmasterlistComponent } from './radaitiontestgroupmasterlist.component';

describe('RadaitiontestgroupmasterlistComponent', () => {
  let component: RadaitiontestgroupmasterlistComponent;
  let fixture: ComponentFixture<RadaitiontestgroupmasterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadaitiontestgroupmasterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadaitiontestgroupmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
