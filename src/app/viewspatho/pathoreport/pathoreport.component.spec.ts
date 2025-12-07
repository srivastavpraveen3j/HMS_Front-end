import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoreportComponent } from './pathoreport.component';

describe('PathoreportComponent', () => {
  let component: PathoreportComponent;
  let fixture: ComponentFixture<PathoreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
