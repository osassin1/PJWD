import { Component, Input, OnInit, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { InventoryService } from '../inventory/inventory.service';
import { ShoppingListService } from '../shoppinglist/shoppinglist.service';

import { ShoppinglistEditComponent } from '../shoppinglist-edit/shoppinglist-edit.component';
import { InventoryEditComponent } from '../inventory-edit/inventory-edit.component'
//import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'
import { Store } from '../models/store.model'
import { ListCategory } from '../models/list_category.model'

@Component({
  selector: 'app-shoppinglist-add',
  standalone: true,
  imports: [
    CommonModule, 
    NgSelectModule,
    ReactiveFormsModule,
    InventoryEditComponent,
    ShoppinglistEditComponent
  ],
  templateUrl: './shoppinglist-add.component.html',
  styleUrl: './shoppinglist-add.component.css'
})


export class ShoppinglistAddComponent implements OnInit, OnDestroy, OnChanges {

  //@Input() shoppingListItem!: ShoppingListInventory;
  @Input() storeID: number = 0;
//  @Input() listCategoryID: number = 0;

//  @Input() store!: Store;
  @Input() inventoryList: Inventory[] = [];
  @Input() list_category!: ListCategory;  

  @Input() familyMemberID: number = 0;
  @Input() shoppingDate: string = "";
  @Input() background: string = "";
  @Input() disabledString: string = "";
  @Output() done = new EventEmitter<boolean>();

  store!: Store; 

  shoppingListAddForm!: FormGroup;

  selectedInventory: any;
 
  newInventory: any;
  
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


    this.store = { store_id: this.storeID, name: ""};

  }

  ngOnDestroy(){
    console.log('OnDestroy')
  }


  ngOnChanges(changes: SimpleChanges){

    if( changes['inventoryList'] != undefined && !changes['inventoryList'].firstChange ){
        this.storeInventoryByCategory = changes['inventoryList'].currentValue;
    }    
  }


  getPicture(inventory_id: number){
    return this.storeInventory.find(i => i.inventory_id==inventory_id)?.picture;
  }

  get storeInventory(){
    return this.inventoryService.storeInventory;
  }


  onInventoryEditDone(inventory_id: number, $event: any){
    //console.log('shoppinglist-add::onInventoryEditDone',$event)
    this.selectedInventory=null;
    this.done.emit($event);
  }



  onNewInventoryDone($event: any){
    this.storeInventory.push(this.newInventory);
    this.storeInventoryByCategory.push(this.newInventory);

    // find the newly added item
    const idx = this.storeInventoryByCategory.find((item:any) => item.inventory_id == this.newInventory.inventory_id);

    // set the new item as selected in ng-select 
    this.shoppingListAddForm.controls['inventoryToAdd'].updateValueAndValidity();
    this.shoppingListAddForm.controls['inventoryToAdd'].reset;

    // and also have it in edit mode
    this.selectedInventory = idx;

    delete this.newInventory;
    this.done.emit($event);
  }

  onSelectedInventory(){
    this.selectedInventory = this.shoppingListAddForm.controls['inventoryToAdd'].value;
    if( this.selectedInventory != undefined && this.selectedInventory.inventory_id ) {
      this.selectedInventory.picture = this.getPicture(this.selectedInventory.inventory_id);
    }
  }
  
  doNewInventoryItemForShoppingList(){
    this.newInventory = <Inventory>{
           inventory_id:0, 
          name: "",
          picture: "no_picture.jpg", 
          notes: "", 
          symbol: "",
          unit: 0,
          family_members: null,
          inventory_to_quantity: {
            quantity_id:0,
            name: "",
            symbol: "",
            unit: 0
          },
          inventory_to_list_category: {
            list_category_id: 0,
            name: "",
            description: "",
          }
    };
  }

  doNothing(){

  }
}

