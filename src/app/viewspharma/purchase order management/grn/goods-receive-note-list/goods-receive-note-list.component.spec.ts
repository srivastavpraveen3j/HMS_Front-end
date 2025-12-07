import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsReceiveNoteListComponent } from './goods-receive-note-list.component';

describe('GoodsReceiveNoteListComponent', () => {
  let component: GoodsReceiveNoteListComponent;
  let fixture: ComponentFixture<GoodsReceiveNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoodsReceiveNoteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsReceiveNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
