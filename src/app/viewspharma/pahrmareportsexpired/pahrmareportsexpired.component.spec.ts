import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PahrmareportsexpiredComponent } from './pahrmareportsexpired.component';

describe('PahrmareportsexpiredComponent', () => {
  let component: PahrmareportsexpiredComponent;
  let fixture: ComponentFixture<PahrmareportsexpiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PahrmareportsexpiredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PahrmareportsexpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
