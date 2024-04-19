import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { InventoryService } from '../inventory/inventory.service';
import { Inventory } from '../models/inventory.model'
import { Store } from '../models/store.model'
import { ListCategory } from '../models/list_category.model'
import { Quantity } from '../models/quantity.model'

import { NgSelectModule } from '@ng-select/ng-select';

import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'


@Component({
  selector: 'app-inventory-edit',
  standalone: true,
  imports: [
    CommonModule, 
    NgSelectModule,
    ReactiveFormsModule,
    InventoryPictureComponent
  ],
  templateUrl: './inventory-edit.component.html',
  styleUrl: './inventory-edit.component.css',
})
export class InventoryEditComponent implements OnInit, OnDestroy {

  @Input() store!: Store;
  @Input() inventory!: Inventory;
  @Input() background!: string;
  @Input() list_category!: ListCategory;
  @Output() done = new EventEmitter<boolean>();


  inventoryEditForm!: FormGroup;

  // get all available quantities
  quantities!: Quantity[];

  // get all list categories
  list_categories!: ListCategory[];

  // for onPicture to toggle value
  takePicture: boolean = false;

  constructor(private inventoryService: InventoryService,
    private formBuilder: FormBuilder ){
  }

  ngOnInit() {

    console.log('store', this.store)
    
    this.inventoryEditForm = this.formBuilder.group({
      name: [this.inventory.name, Validators.required],
      notes: this.inventory.notes,
      picture: this.inventory.picture,
      store_id: this.store.store_id,
      list_category: this.list_category,
      quantity: this.inventory.inventory_to_quantity
  });

    // the category can either come from an existing inventory item
    // or will be provided externally to create a new item in which
    // case it could also be undefined and needs to be set
    if( this.list_category === undefined && this.inventory.inventory_to_list_category.list_category_id){
      this.inventoryEditForm.controls['list_category'].setValue(this.inventory.inventory_to_list_category);
    }

    this.inventoryService.getListCatgory().subscribe(res => {
      this.list_categories = res;
    }) 

    this.inventoryService.getQuantities().subscribe(res => {
      this.quantities = res;
      if( !this.inventory.inventory_to_quantity.quantity_id ) {
        this.inventoryEditForm.controls['quantity'].setValue( this.quantities.find((item)=> item.quantity_id == 3) );
      }
    })
    
  }

  ngOnDestroy(): void {
    console.log('InventoryEditComponent', 'ngOnDestroy')  
    //this.inventory.picture = "no_picture.jpg";
    //this.done.emit(false);
  }

  get ief(){
    return this.inventoryEditForm.value['inventoryForm'];
  }

 
  onPicture(){
    console.log('onPicture');
    this.takePicture = !this.takePicture;
  }

  onDoneEdit(){
    this.inventory.name = this.inventoryEditForm.controls['name'].value;
    this.inventory.notes = this.inventoryEditForm.controls['notes'].value;
    this.inventory.inventory_to_quantity.quantity_id = this.inventoryEditForm.controls['quantity'].value['quantity_id'];
    this.inventory.inventory_to_list_category.list_category_id = this.inventoryEditForm.controls['list_category'].value['list_category_id'];

    if( this.inventory.inventory_id ){
      this.inventoryService.updateInventoryItem(
        this.inventory.inventory_id,
        this.inventory.name,
        this.inventory.notes,
        this.inventory.picture,
        this.store.store_id, 
        this.inventory.inventory_to_list_category.list_category_id,
        this.inventory.inventory_to_quantity.quantity_id,
        ).subscribe({
          next: (v) => {
            console.log('updateInventoryItem', v)
          },
          complete: () => {
            this.done.emit(true);
          }
        }) 
    } else {

      // console.log('InventoryEditComponent this.inventory', this.inventory)
      // console.log('InventoryEditComponent this.store', this.store)


        this.inventoryService.createInventoryItem(
          this.inventory.name,
          this.inventory.notes,
          this.inventory.picture,
          this.store.store_id, 
          this.inventory.inventory_to_list_category.list_category_id,
          this.inventory.inventory_to_quantity.quantity_id,
          ).subscribe({
            next: (v) => {
              this.inventory.inventory_id = v;

              // add the new picture to the inventory (of pictures)
              this.inventoryService.pictureInventory.set(this.inventory.inventory_id, this.inventory.picture)
            },
            complete: () => {
              this.done.emit(true);
            }
          }) 
          
  
    }
    this.inventoryEditForm.reset();
  }

  onCancelEdit(){
    this.done.emit(false);
  }


  // ngOnChanges(){
  //   console.log('ngOnChanges')
  //   console.log('ngOnChanges: store', this.store)
  // }



}
