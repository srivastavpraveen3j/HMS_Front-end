import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsReceiveNoteComponent } from './goods-receive-note.component';

describe('GoodsReceiveNoteComponent', () => {
  let component: GoodsReceiveNoteComponent;
  let fixture: ComponentFixture<GoodsReceiveNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodsReceiveNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsReceiveNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
