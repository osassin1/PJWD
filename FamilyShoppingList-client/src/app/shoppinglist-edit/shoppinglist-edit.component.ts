import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { InventoryService } from '../inventory/inventory.service';
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

    // get all available quantities
    //quantities: any;

    // get all list categories
    //list_categories: any;
  
    // for onPicture to toggle value
    takePicture: boolean = false;

    quantity: number = 0;

  constructor(
    //private inventoryService: InventoryService,
    private shoppingListService: ShoppingListService,
    private formBuilder: FormBuilder ){
  }


  ngOnInit() {

    this.quantity = parseInt(this.shoppingListItem.family_members.find((v:any) => v.family_member_id == this.familyMemberID )?.quantity || "1" );

    this.shoppingListEditForm = this.formBuilder.group({
        quantity: this.quantity
    });

    // this.inventoryService.getQuantities().subscribe(res => {
    //   this.quantities = res;
    // })

    // this.inventoryService.getListCatgory().subscribe(res => {
    //   this.list_categories = res;
    // }) 
  }



  onDoneEdit(){
      this.shoppingListService.updateShoppingList(
        this.shoppingDate,
        this.familyMemberID,
        this.shoppingListItem.inventory_id, 
        this.quantity).subscribe({
          next: (v) => {
            console.log('onDoneEdit',v)
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
