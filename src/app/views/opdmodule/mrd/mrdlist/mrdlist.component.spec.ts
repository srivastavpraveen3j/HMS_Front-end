import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MrdlistComponent } from './mrdlist.component';

describe('MrdlistComponent', () => {
  let component: MrdlistComponent;
  let fixture: ComponentFixture<MrdlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MrdlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MrdlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
