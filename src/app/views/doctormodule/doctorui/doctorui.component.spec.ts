import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctoruiComponent } from './doctorui.component';

describe('DoctoruiComponent', () => {
  let component: DoctoruiComponent;
  let fixture: ComponentFixture<DoctoruiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctoruiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctoruiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
