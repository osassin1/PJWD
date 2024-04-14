import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistNewComponent } from './shoppinglist-new.component';

describe('ShoppinglistNewComponent', () => {
  let component: ShoppinglistNewComponent;
  let fixture: ComponentFixture<ShoppinglistNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppinglistNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppinglistNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
