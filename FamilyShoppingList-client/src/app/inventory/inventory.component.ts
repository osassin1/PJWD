import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { Inventory } from '../models/inventory.model'
import { Store } from '../models/store.model'
import { ListCategory } from '../models/list_category.model'

import { InventoryService } from '../inventory/inventory.service';
import { ShoppingListService } from '../shoppinglist/shoppinglist.service';

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

  // get all categories that inventory can be categorized in
  categoriesToSelectFrom: any[] = [];

  // what category was selected - adjust view
  //list_category_id: number = 0;
  list_category: ListCategory = {
    list_category_id: 0,
    name: ""
  };

  // activate inventory edit
  inventoryEdit: boolean[] = [];
  inventoryTrash: boolean[] = [];
  inventoryReferences: number[] = [];

  // remember the store_id for the child component
  store_id: number = 0;


  // adding a new inventory item
  isAddNewInventoryItem: boolean = false;

  newInventory: Inventory = {
    inventory_id: 0,
    name: "",
    picture: "no_picture.jpg",
    notes: "",
    symbol: "",
    unit: 0,
    family_members: null,
    inventory_to_quantity: {
      quantity_id: 0,
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

  constructor(
    private inventoryService: InventoryService,
    private shoppingListService: ShoppingListService,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.inventoryForm = this.formBuilder.group({
      storesToSelectFrom: this.shoppingListService.store,
      categoriesToSelectFrom: null,
    });

    // get all shops that can be shopped from
    this.inventoryService.getListOfStores().subscribe((response: Store[]) => {
      this.storesToSelectFrom = response;
    });

    // get all categories one can shop from
    this.inventoryService.getListCatgory().subscribe((response: any) => {
      this.categoriesToSelectFrom = response;
    });
    this.fbc['categoriesToSelectFrom'].setValue(null);
  }

  get fbc() {
    return this.inventoryForm.controls;
  }

  get storeInventory() {
    return this.inventoryService.storeInventory;
  }

  getBG(e: any) {
    if (e) {
      return "bg-even";
    } else {
      return "bg-odd";
    }
  }

  onStoreSelectChange() {
    this.store_id = this.fbc['storesToSelectFrom'].value['store_id'];
    this.inventoryService.loadInventoryByStore(this.store_id);
  }

  onClearCategoriesToSelectFrom() {
    this.list_category = <ListCategory>{
      list_category_id: 0,
      name: ""
    };
    this.inventoryEdit.fill(false)
  }

  onCategorySelectChange() {
    this.list_category = this.fbc['categoriesToSelectFrom'].value;
    this.store_id = this.fbc['storesToSelectFrom'].value['store_id'];

    if (this.fbc['categoriesToSelectFrom'].value != null) {
      this.inventoryService.getInventoryByStoreForEditByCategory(this.store_id, this.list_category.list_category_id)
        .subscribe({
          next: (v) => {
            let a = JSON.parse(v);
            this.inventoryService.storeInventory = a;
            this.inventoryEdit = [];
            this.inventoryEdit.fill(false)
          }, error: (e) => {
            console.error(e.error.message);
          }, complete: () => {
          }
        })
    } else {
      this.inventoryService.loadInventoryByStore(this.store_id);
    }
  }

  // Activate the create action for an inventory item
  onCreateItem(inventory_id: number, $event: any) {
    if (this.isAddNewInventoryItem && inventory_id) {
      this.isAddNewInventoryItem = false;
    }
    this.isAddNewInventoryItem = false;

    if ($event) {
      this.onStoreSelectChange();
    }
    console.log('onCreateItem-->newInventory',this.newInventory)

    this.newInventory.inventory_id = 0;
    this.newInventory.name = "";
    this.newInventory.picture =  "no_picture.jpg";
    this.newInventory.notes = "";
  }

  // Activate the edit action for an inventory item
  onPenEdit(inventory_id: number, $event: any) {
    this.inventoryEdit[inventory_id] = !this.inventoryEdit[inventory_id];
    if (this.isAddNewInventoryItem && inventory_id) {
      this.isAddNewInventoryItem = false;
    }
    this.isAddNewInventoryItem = false;

    if ($event) {
      this.onStoreSelectChange();
    }
    console.log('newInventory',this.newInventory)
  }


  // Delete an inventory item
  onTrash(inventory_id: number) {
    this.inventoryTrash[inventory_id] = !this.inventoryTrash[inventory_id];

    if (!this.inventoryTrash[inventory_id]) {
      return;
    }
    this.checkInventoryForDeletion(inventory_id)
  }

  // Actiavte the add action for a category
  onAddInvetoryItem(list_category_id: number) {
    console.log('onAddInvetoryItem', this.list_category.list_category_id)
  }

  doCancelDeletion(inventory_id: number) {
    this.inventoryTrash[inventory_id] = false;
  }

  doExecuteDeletion(inventory_id: number) {
    this.inventoryService.deleteInventoryItem(inventory_id).subscribe({
      next: (v) => {
        console.log('doExecuteDeletion', v)
      }, complete: () => {
        this.inventoryTrash[inventory_id] = false;
        this.inventoryEdit[inventory_id] = false;
        this.inventoryReferences[inventory_id] = 0;
        this.onStoreSelectChange();
      }
    })
  }

  doAddNewInventoryItem() {
    this.isAddNewInventoryItem = !this.isAddNewInventoryItem;
  }

  checkInventoryForDeletion(inventory_id: number) {
    this.inventoryService.checkInventoryForDeleteion(inventory_id).subscribe({
      next: (v) => {
        this.inventoryReferences[inventory_id] = v['NumberOfReferences'];
      }
    })
  }
}

//--- end of file ---