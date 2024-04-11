import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { InventoryService } from '../inventory/inventory.service';
import { ShoppingListService } from '../shoppinglist/shoppinglist.service';

import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'
//import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'

@Component({
  selector: 'app-shoppinglist-add',
  standalone: true,
  imports: [
    CommonModule, 
    NgSelectModule,
    ReactiveFormsModule,
    InventoryPictureComponent,
  ],
  templateUrl: './shoppinglist-add.component.html',
  styleUrl: './shoppinglist-add.component.css'
})
export class ShoppinglistAddComponent implements OnInit {

  //@Input() shoppingListItem!: ShoppingListInventory;
  @Input() storeID: number = 0;
  @Input() listCategoryID: number = 0;
  @Input() familyMemberID: number = 0;
  @Input() shoppingDate: string = "";
  @Input() background: string = "";
  @Input() disabledString: string = "";
  @Output() done = new EventEmitter<boolean>();

  shoppingListAddForm!: FormGroup;

  selectedInventory: any;
  storeInventoryByCategory:  Inventory[] = [];

  constructor(
    private inventoryService: InventoryService,
    private shoppingListService: ShoppingListService,
    private formBuilder: FormBuilder ){
  }  

  ngOnInit() {

    this.shoppingListAddForm = this.formBuilder.group({
        inventoryToAdd: null
    });

    console.log('storeID', this.storeID)
    console.log('listCategoryID', this.listCategoryID)

    this.storeInventoryByCategory = [];
    this.inventoryService.getInventoryByStoreForEditByCategory(this.storeID, this.listCategoryID)
      .subscribe({
        next: (v) => {
          this.storeInventoryByCategory =  JSON.parse(v);
        },
        complete: () => {
          return this.storeInventoryByCategory;
        }
      })
      return this.storeInventoryByCategory;
  
    // this.inventoryService.getQuantities().subscribe(res => {
    //   this.quantities = res;
    // })

    // this.inventoryService.getListCatgory().subscribe(res => {
    //   this.list_categories = res;
    // }) 
  }



  doNothing(){

  }
}

