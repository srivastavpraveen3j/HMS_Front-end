import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisittypemasterComponent } from './visittypemaster.component';

describe('VisittypemasterComponent', () => {
  let component: VisittypemasterComponent;
  let fixture: ComponentFixture<VisittypemasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisittypemasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisittypemasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
