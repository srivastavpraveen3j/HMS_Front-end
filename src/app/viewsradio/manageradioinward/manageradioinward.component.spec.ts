import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageradioinwardComponent } from './manageradioinward.component';

describe('ManageradioinwardComponent', () => {
  let component: ManageradioinwardComponent;
  let fixture: ComponentFixture<ManageradioinwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageradioinwardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageradioinwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
