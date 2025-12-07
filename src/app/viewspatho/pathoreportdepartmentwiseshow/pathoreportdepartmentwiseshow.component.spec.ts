import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoreportdepartmentwiseshowComponent } from './pathoreportdepartmentwiseshow.component';

describe('PathoreportdepartmentwiseshowComponent', () => {
  let component: PathoreportdepartmentwiseshowComponent;
  let fixture: ComponentFixture<PathoreportdepartmentwiseshowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoreportdepartmentwiseshowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoreportdepartmentwiseshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
