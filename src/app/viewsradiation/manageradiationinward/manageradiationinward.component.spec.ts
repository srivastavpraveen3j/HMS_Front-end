import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageradiationinwardComponent } from './manageradiationinward.component';

describe('ManageradiationinwardComponent', () => {
  let component: ManageradiationinwardComponent;
  let fixture: ComponentFixture<ManageradiationinwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageradiationinwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageradiationinwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
