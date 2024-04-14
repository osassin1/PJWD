import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


import { ShoppingListService } from '../shoppinglist/shoppinglist.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { InventoryService } from '../inventory/inventory.service';

import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'
import { ShoppingListDates } from '../models/shopping_list_dates.model'


@Component({
  selector: 'app-shoppinglist-new',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule

  ],
  templateUrl: './shoppinglist-new.component.html',
  styleUrl: './shoppinglist-new.component.css'
})
export class ShoppinglistNewComponent implements OnInit {

  //@Input() storesToSelectFrom: any;
  @Input() familyMemberID: number = 0;
  @Input() background: string = "";
  @Output() done = new EventEmitter<boolean>();
  
  storesToSelectFrom: any;

  shoppinglistNewForm!: FormGroup;
  dateToday = new Date();

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService:InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder ){
  }
  
  ngOnInit(): void {
    this.shoppinglistNewForm = this.formBuilder.group({
      newShoppingListDate: ['', Validators.required],
      storesToSelectFrom:  ['', Validators.required],
    });   
    
    
    const year = this.dateToday.getFullYear()

    let month: number | string = this.dateToday.getMonth() + 1
    let day: number | string = this.dateToday.getDate()

    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day

    var today = year + "-" + month + "-" + day;

    this.shoppinglistNewForm.controls['newShoppingListDate'].setValue(today);    

    // get all shops that can be shoppedn from
    this.inventoryService.getListOfStores().subscribe((response: any) => {
      this.storesToSelectFrom = response;
      //console.log('this.inventoryService.getListOfStores', this.storesToSelectFrom)
    });

  }


  get slnf(){
    return this.shoppinglistNewForm.controls;
  }

  onCancelAddNewShoppingList(){
    console.log('onCancelAddNewShoppingList')
    this.done.emit(false);

  }

  onConfirmAddNewShoppingList(){
    console.log('onConfirmAddNewShoppingList')

    const [year, month, day] = this.slnf['newShoppingListDate'].value.split("-")
    const newDateString = `${month}/${day}/${year}`;

    // this.shoppingListService.shoppingList = JSON.parse('{ "shopping_date": "' + newDateString +
    //   '", "shopping_list_to_family_member.family_id": "' + this.authenticationService.familyMemberValue!.family_id +
    //   '", "shopping_list_to_inventory.inventory_to_store.store_id": "' + this.slnf['storesToSelectFrom'].value['store_id'] +
    //   '", "shopping_list_to_inventory.inventory_to_store.name": "' + this.slnf['storesToSelectFrom'].value['name'] +
    //   '" } ');

      /*
      export interface ShoppingListDates {
        shopping_date : string,
        store_id : number,
        family_id : number,
        name: string
    }
    */      

    this.shoppingListService.shoppingList = <ShoppingListDates>{ 
      shopping_date: newDateString, 
      store_id: this.slnf['storesToSelectFrom'].value['store_id'],
      family_id: this.authenticationService.familyMemberValue!.family_id,
      name: this.slnf['storesToSelectFrom'].value['name']
    };

    this.slnf['storesToSelectFrom'].reset();
    this.slnf['newShoppingListDate'].reset();
  
    this.done.emit(true);

  }


}
