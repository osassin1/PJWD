import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


import { ShoppingListService } from '../shoppinglist/shoppinglist.service';


import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'

@Component({
  selector: 'app-shoppinglist-edit',
  standalone: true,
  imports: [
    CommonModule, 
    NgSelectModule,
    ReactiveFormsModule,
    InventoryPictureComponent,
  ],
  templateUrl: './shoppinglist-edit.component.html',
  styleUrl: './shoppinglist-edit.component.css'
})
export class ShoppinglistEditComponent implements OnInit{

  // @Input() store!: Store;
  @Input() shoppingListItem!: ShoppingListInventory | Inventory;
  @Input() familyMemberID: number = 0;
  @Input() shoppingDate: string = "";
  @Input() background: string = "";
  @Input() disabledString: string = "";
  @Output() done = new EventEmitter<boolean>();

  shoppingListEditForm!: FormGroup;


    quantity: number = 0;

  constructor(
    private shoppingListService: ShoppingListService,
    private formBuilder: FormBuilder ){
  }


  ngOnInit() {
    // Select the quantity for a family member if they already have the item
    // otherwise it's new and gets the default value of 1 (based on feedback)
    if( this.shoppingListItem.family_members ){
      this.quantity = parseInt(this.shoppingListItem.family_members.find((v:any) => v.family_member_id == this.familyMemberID )?.quantity || "1" );
    } else {
      this.quantity = 1;
    }

    this.shoppingListEditForm = this.formBuilder.group({
        quantity: this.quantity
    });

    //console.log('ShoppinglistEditComponent', this.shoppingListItem )
  }



  onDoneEdit(){
      this.shoppingListService.updateShoppingList(
        this.shoppingDate,
        this.familyMemberID,
        this.shoppingListItem.inventory_id, 
        this.quantity).subscribe({
          next: (v) => {
            console.log('shoppinglist-edit::onDoneEdit',v)
          },
          error: (e) => {
            console.error('error', e);
          },
          complete: () => {
            this.done.emit(true);
          }
        });
    }    
  

  onCancelEdit(){
    console.log('onDoneEdit')
    this.done.emit(false);
  }  


  doIncreaseShoppingListQuantity(){
    if( this.quantity <= 49 ) {
      this.quantity++;
    }
  }

  doDecreaseShoppingListQuantity(){
    if( this.quantity - 1 >= 0 ) {
      this.quantity--;
    }
  }

  doUpdateQuantity($event: any){
    if ($event.target.value >= 0 && $event.target.value <= 50) {
      this.quantity = $event.target.value;
    }
  }


  adjustForDecimals(x: any, unit: number) {
    if (unit == 2) {  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }


}
