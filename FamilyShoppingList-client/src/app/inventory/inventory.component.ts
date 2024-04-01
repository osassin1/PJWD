import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../inventory/inventory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule, NgStyle } from '@angular/common';

//import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';

import { ChangeDetectionStrategy, ChangeDetectorRef, OnInit, ViewEncapsulation } from '@angular/core';

// import { GuiColumn, GuiGridModule } from '@generic-ui/ngx-grid';
// import { GuiColumnMenu, GuiRowSelection, GuiRowSelectionMode, GuiRowSelectionType, GuiSorting, GuiSortingOrder, GuiSummaries } from '@generic-ui/ngx-grid';
import { GuiColumnMenu, GuiRowSelection, GuiRowSelectionMode, GuiRowSelectionType, GuiSorting, GuiSortingOrder, GuiSummaries, GuiColumnSorting } from '@generic-ui/ngx-grid';

import { Inventory } from '../models/inventory.model'
import { Store } from '../models/store.model'
import { InventoryEditComponent } from '../inventory-edit/inventory-edit.component'

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    InventoryEditComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements OnInit {

  inventoryForm!: FormGroup;

  // get all stores that family/members can shop from
  storesToSelectFrom: any[] = [];

  // all defined categories, they are fixed for now
  listCategories: any[] = [];

  // inventory for store
  storeInventory: any[] = [];

  // activate inventory edit
  inventoryEdit: boolean[] = [];

  // remember the store_id for the child component
  store_id: number = 0;

  columnSorting = {
    enabled: true,
    matcher: (inventory: Inventory) => inventory.name,
    order: GuiSortingOrder.ASC
  };

  constructor(
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder,
    ) {
  }

 
  ngOnInit() {

    this.inventoryForm = this.formBuilder.group({
      storesToSelectFrom:  null,
      editPicture: null,
      editName: null,
      editNote: null
    });

  
    // get all shops that can be shopped from
    this.inventoryService.getListOfStores().subscribe((response: Store[]) => {
      this.storesToSelectFrom = response;
      console.log('this.inventoryService.getListOfStores', this.storesToSelectFrom)
    });
    // get all categories one can shop from
    this.inventoryService.getListCatgory().subscribe((response: any) => {
      this.listCategories = response;
      console.log('this.inventoryService.getListCatgory', this.listCategories)
    });

    
  }



  //--- on ---

  onStoreSelectChange(){
    return;
    console.log('onStoreSelectChange', this.fbc['storesToSelectFrom'])
    // this.inventoryService.getInventoryByStore( this.fbc['storesToSelectFrom'].value['store_id']).subscribe((response: any) => {
    //   console.log('getInventoryByCategory', response)
    //   this.storeInventory =  response;
    // })


    // this.shoppingListAll.get(list_category_id)?.forEach((p => {
    //   this.inventoryService.loadPicture(p.inventory_id);
    //   this.inventoryService.loadInventory(store_id, p.inventory_id);


    this.listCategories.forEach(x=>{
      let list_category_id = x['list_category_id'];
      this.store_id = this.fbc['storesToSelectFrom'].value['store_id'];
      console.log('list_category_id',list_category_id, 'store_id', this.store_id)


      
      //this.storeInventory[list_category_id] = this.inventoryService.loadInventory(, list_category_id)
        this.inventoryService.getInventoryByCategory( this.store_id, list_category_id).subscribe((response: any) => {
            console.log('getInventoryByCategory', response)
            response.forEach((x:any)=>{
              this.inventoryService.loadPicture(x['inventory_id']);
              this.inventoryService.loadInventory(this.store_id, x['inventory_id']);
            })
            this.storeInventory[list_category_id] =  response;
          })      
    })
    
  }

  // Activate the edit action for an inventory item
  onPenEdit(inventory_id: number){
    console.log('onPenEdit', 'inventory_id', inventory_id)
    this.inventoryEdit[inventory_id] = !this.inventoryEdit[inventory_id];

    if(!this.inventoryEdit[inventory_id]){
      return;
    }
    
    console.log('getInventoryByID', this.inventoryService.getInventoryByID(inventory_id))

    this.fbc['editName'].setValue(this.inventoryService.getInventoryByID(inventory_id)['inventory_name'])
    
  }

  // Actiavte the add action for a category
  onAddInvetoryItem(list_category_id: number){
    console.log('onAddInvetoryItem', list_category_id)
  }

  //--- get ---
  get fbc(){
    return this.inventoryForm.controls;
  }

    // Get the picture information as a string
  // from the inventory cache
  getPicture(inventory_id: number): SafeUrl {
    return this.inventoryService.pictureInventory.get(inventory_id) ?? "no_picture.jpg";
  }

  

}
