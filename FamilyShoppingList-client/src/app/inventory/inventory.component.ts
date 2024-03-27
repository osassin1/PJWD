import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from '../inventory/inventory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule, NgStyle } from '@angular/common';

//import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {

  inventoryForm!: FormGroup;

  // get all stores that family/members can shop from
  storesToSelectFrom: any[] = [];

  // all defined categories, they are fixed for now
  listCategories: any[] = [];

  // inventory for store
  storeInventory: any[] = [];

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
    this.inventoryService.getListOfStores().subscribe((response: any) => {
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
    console.log('onStoreSelectChange', this.fbc['storesToSelectFrom'])
    // this.inventoryService.getInventoryByStore( this.fbc['storesToSelectFrom'].value['store_id']).subscribe((response: any) => {
    //   console.log('getInventoryByCategory', response)
    //   this.storeInventory =  response;
    // })

    this.listCategories.forEach(x=>{
      let list_category_id = x['list_category_id'];
      let store_id = this.fbc['storesToSelectFrom'].value['store_id'];
      console.log('list_category_id',list_category_id, 'store_id', store_id)
      
      //this.storeInventory[list_category_id] = this.inventoryService.loadInventory(, list_category_id)
        this.inventoryService.getInventoryByCategory( store_id, list_category_id).subscribe((response: any) => {
            console.log('getInventoryByCategory', response)
            this.storeInventory[list_category_id] =  response;
          })      
    })
    
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
