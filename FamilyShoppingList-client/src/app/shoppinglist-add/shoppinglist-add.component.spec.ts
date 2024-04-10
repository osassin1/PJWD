import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistAddComponent } from './shoppinglist-add.component';

describe('ShoppinglistAddComponent', () => {
  let component: ShoppinglistAddComponent;
  let fixture: ComponentFixture<ShoppinglistAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppinglistAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppinglistAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
