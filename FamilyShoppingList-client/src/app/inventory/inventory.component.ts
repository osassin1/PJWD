import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../inventory/inventory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';

//import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';

import { OnInit } from '@angular/core';

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

  // inventory for store
  storeInventory: any[] = [];

  // activate inventory edit
  inventoryEdit: boolean[] = [];
  inventoryTrash: boolean[] = [];
  inventoryReferences: number[] = [];

  // remember the store_id for the child component
  store_id: number = 0;



  constructor(
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder,
    ) {
  }

 
  ngOnInit() {

    this.inventoryForm = this.formBuilder.group({
      storesToSelectFrom:  null,
    });

  
    // get all shops that can be shopped from
    this.inventoryService.getListOfStores().subscribe((response: Store[]) => {
      this.storesToSelectFrom = response;
      console.log('this.inventoryService.getListOfStores', this.storesToSelectFrom)
    });


    
  }



  //--- on ---

  onStoreSelectChange(){
    this.store_id=this.fbc['storesToSelectFrom'].value['store_id'];
    this.storeInventory = [];

    this.inventoryService.getInventoryByStoreForEdit(this.store_id).subscribe({
      next: (v) => {
        let a = JSON.parse(v);
        this.storeInventory = a;
      }, error: (e) => {
        console.error(e.error.message);
      },
      complete: () => {
      }
    })
  }



getBG(e: any){
  if (e){
    return "bg-even";
  } else {
    return "bg-odd";
  }
}

  // Activate the edit action for an inventory item
  onPenEdit(inventory_id: number, $event: any){
    console.log('onPenEdit', 'inventory_id', inventory_id)
    console.log('onPenEdit', '$event', $event)

    this.inventoryEdit[inventory_id] = !this.inventoryEdit[inventory_id];

    if($event){
      this.onStoreSelectChange();
    }
    
  }


// Delete an inventory item
onTrash(inventory_id: number){
  this.inventoryTrash[inventory_id] = !this.inventoryTrash[inventory_id];

  if(!this.inventoryTrash[inventory_id]){
    return;
  }

  console.log('checkInventoryForDeletion', inventory_id)
  this.checkInventoryForDeletion(inventory_id)
  
  
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

  checkInventoryForDeletion(inventory_id: number){
    this.inventoryService.checkInventoryForDeleteion(inventory_id).subscribe({
      next: (v) => {
        console.log('checkInventoryForDeletion', v);
        this.inventoryReferences[inventory_id] = v['NumberOfReferences'];
      }
    })
  }


//--- do ----

doCancelDeletion(inventory_id:number){
  console.log('doCancelDeletion', inventory_id)
}

doExecuteDeletion(inventory_id:number){
  console.log('doExecuteDeletion', inventory_id)
  this.inventoryService.deleteInventoryItem(inventory_id).subscribe({
    next: (v) => {
      console.log('doExecuteDeletion', v)
    },
    complete: () => {
      this.inventoryTrash[inventory_id] = false;
      this.inventoryEdit[inventory_id] = false;
      this.inventoryReferences[inventory_id] = 0;
      this.onStoreSelectChange();
    }
    
  })
}
 

}
