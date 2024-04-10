import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistEditComponent } from './shoppinglist-edit.component';

describe('ShoppinglistEditComponent', () => {
  let component: ShoppinglistEditComponent;
  let fixture: ComponentFixture<ShoppinglistEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppinglistEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppinglistEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
