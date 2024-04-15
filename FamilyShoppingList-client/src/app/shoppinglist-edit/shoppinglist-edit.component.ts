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

  @Input() shoppingListItem!: ShoppingListInventory | Inventory;
  @Input() background: string = "";
  @Input() disabledString: string = "";
  @Output() done = new EventEmitter<any>();
  @Output() inventory_id = new EventEmitter<number>();

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

    console.log('ShoppinglistEditComponent--this.shoppingList', this.shoppingList)
  }

get shoppingList(){
  return this.shoppingListService.shoppingList;
}

get familyMemberID(){
  return this.shoppingListService.familyMemberID;
}



  onDoneEdit(){
    // console.log('shoppinglist-edit::onDoneEdit  this.familyMemberID',  this.familyMemberID)
    // console.log('shoppinglist-edit::onDoneEdit  this.shoppingListItem.inventory_id',  this.shoppingListItem.inventory_id)
    // console.log('shoppinglist-edit::onDoneEdit  this.shoppingListItem',  this.shoppingListItem)
    // console.log('shoppinglist-edit::onDoneEdit  this.shoppingList',  this.shoppingList)

      this.shoppingListService.updateShoppingList(
        this.shoppingList.shopping_date,
        this.familyMemberID,
        this.shoppingListItem.inventory_id, 
        this.quantity).subscribe({
          next: (v) => {
            console.log('shoppinglist-edit::onDoneEdit v:',v)
          },
          error: (e) => {
            console.error('error', e);
          },
          complete: () => {
            this.inventory_id.emit(this.shoppingListItem.inventory_id);
            this.done.emit(true);
          }
        });
    }    
  

  onCancelEdit(){
    this.inventory_id.emit(this.shoppingListItem.inventory_id);
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
