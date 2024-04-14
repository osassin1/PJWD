import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppinglistCntrlComponent } from './shoppinglist-cntrl.component';

describe('ShoppinglistCntrlComponent', () => {
  let component: ShoppinglistCntrlComponent;
  let fixture: ComponentFixture<ShoppinglistCntrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppinglistCntrlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppinglistCntrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
