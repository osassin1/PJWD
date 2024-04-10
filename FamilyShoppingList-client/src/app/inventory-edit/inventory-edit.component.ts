import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { InventoryService } from '../inventory/inventory.service';
import { Inventory } from '../models/inventory.model'
import { Store } from '../models/store.model'
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
  changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None  

})
export class InventoryEditComponent implements OnInit {

  @Input() store!: Store;
  @Input() inventory!: Inventory;
  @Input() background!: string;
  @Output() done = new EventEmitter<boolean>();


  inventoryEditForm!: FormGroup;

  // get all available quantities
  quantities: any;

  // get all list categories
  list_categories: any;

  // for onPicture to toggle value
  takePicture: boolean = false;

  constructor(private inventoryService: InventoryService,
    private formBuilder: FormBuilder ){

  }

  ngOnInit() {
    this.inventoryEditForm = this.formBuilder.group({
      inventoryForm: this.formBuilder.group({
        name: [this.inventory.name, Validators.required],
        notes: this.inventory.notes,
        picture: this.inventory.picture,
        store_id: this.store.store_id,
        list_category: this.inventory.inventory_to_list_category,
        quantity: this.inventory.inventory_to_quantity
      })
    });

    this.inventoryService.getQuantities().subscribe(res => {
      this.quantities = res;
    })

    this.inventoryService.getListCatgory().subscribe(res => {
      this.list_categories = res;
    }) 
  }

  get ief(){
    return this.inventoryEditForm.value['inventoryForm'];
  }
  
  onPicture(){
    console.log('onPicture');
    this.takePicture = !this.takePicture;
  }

  onDoneEdit(){
    // console.log('edonDoneEditit')
    // console.log('onDoneEdit', this.inventoryEditForm.value['inventoryForm'].name );
    // console.log('onDoneEdit', this.inventoryEditForm.value['inventoryForm'].notes );
    // console.log('onDoneEdit', this.inventoryEditForm.value['inventoryForm'].picture );
    // console.log('onDoneEdit', this.inventoryEditForm.value['inventoryForm'].list_category.list_category_id );
    // console.log('onDoneEdit', this.inventoryEditForm.value['inventoryForm'].quantity.quantity_id );

    if( this.inventory.inventory_id ){
      this.inventoryService.updateInventoryItem(
        this.inventory.inventory_id,
        this.inventoryEditForm.value['inventoryForm'].name, 
        this.inventoryEditForm.value['inventoryForm'].notes,
        this.inventory.picture,
        this.inventoryEditForm.value['inventoryForm'].store_id, 
        this.inventoryEditForm.value['inventoryForm'].list_category.list_category_id, 
        this.inventoryEditForm.value['inventoryForm'].quantity.quantity_id
        ).subscribe({
          next: (v) => {
            console.log('updateInventoryItem', v)
          },
          complete: () => {
            this.done.emit(true);
          }
        }) 
    } else {
        //createInventoryItem(name: string, picture: string, store_id: number, list_category_id: number, quantity_id: number ) 
        this.inventoryService.createInventoryItem(
          this.inventoryEditForm.value['inventoryForm'].name, 
          this.inventoryEditForm.value['inventoryForm'].notes,
          this.inventory.picture,
          this.inventoryEditForm.value['inventoryForm'].store_id, 
          this.inventoryEditForm.value['inventoryForm'].list_category.list_category_id, 
          this.inventoryEditForm.value['inventoryForm'].quantity.quantity_id
          ).subscribe({
            next: (v) => {
              this.inventory.inventory_id = v;
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
