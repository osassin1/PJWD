import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { ShoppingListService } from '../shoppinglist/shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';

import { ShoppinglistNewComponent } from '../shoppinglist-new/shoppinglist-new.component';
import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'

import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'
import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { Store } from '../models/store.model';
import { ListCategory } from '../models/list_category.model';

@Component({
  selector: 'app-shoppinglist-cntrl',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    ShoppinglistNewComponent
  ],
  templateUrl: './shoppinglist-cntrl.component.html',
  styleUrl: './shoppinglist-cntrl.component.css'
})

export class ShoppinglistCntrlComponent implements OnInit{

  @ViewChild('newShoppingList', { static: false }) newShoppingListButton!: ElementRef;

  @Input() familyMemberID: any;
//  @Input() storesToSelectFrom: any;
  @Input() background: any;




  shoppinglistCntrlForm!: FormGroup;

    // adding new shopping list via the 
  // icon (bi-plus) in the shopping list
  // change it to bi-dash when clicked
  iconPlusMinus: string = "bi-plus";


  // shopping process
  isImageDisabled: boolean = false;
  // isShopping: boolean = false;
  // isCheckout: boolean = false;
  // isCheckoutConfirm: boolean = false;
  statusShoppingList: number = 0;


  constructor(
    private shoppingListService: ShoppingListService,
    private authenticationService: AuthenticationService,
    private inventoryService:InventoryService,
    private formBuilder: FormBuilder ){
  }
  
  ngOnInit(): void {
    this.shoppinglistCntrlForm = this.formBuilder.group({
      shopping_list_form: this.shoppingListService.shoppingList,
    });   

    // Get all shopping dates currently available; it's the content
    // for the first selector <Select Shopping List>    
    console.log('this.authenticationService.familyMemberValue!.family_id', this.authenticationService.familyMemberValue!.family_id)
    this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
      this.shoppingToSelectFrom = response;
      //this.selectedShoppingList = true; 
      console.log('this.shoppingToSelectFrom', this.shoppingToSelectFrom)
      console.log('this.shoppingListService.shoppingList', this.shoppingListService.shoppingList)
    });

    this.inventoryService.getListCatgory().subscribe(res => {
      this.listCategory = res;
      console.log('listCategory', this.listCategory)
    }) 
    
  }


  get shoppingToSelectFrom(){
    return this.shoppingListService.shoppingToSelectFrom;
  }

  get selectedShoppingList(){
    return this.shoppingListService.selectedShoppingList;
  }

  set shoppingToSelectFrom(s: any){
    this.shoppingListService.shoppingToSelectFrom = s;
  }

  set selectedShoppingList(s: any){
    this.shoppingListService.selectedShoppingList = s
  }

  get listCategory(){
    return this.shoppingListService.listCategory;
  }
  set listCategory(s:any){
    this.shoppingListService.listCategory = s;
  }

  get shoppingListAllTotal(){
    return this.shoppingListService.shoppingListAllTotal;
  }


  onShoppinglistNewDone($event:any){
    if( $event ) {
      //this.newShoppingListCreated = true; 
      this.slcf['shopping_list_form'].setValue(this.shoppingListService.shoppingList);
    }
    else {
      //this.newShoppingListCreated = false;
    }
  
    // this will 'click' on the add (+/-) button
    const event = new MouseEvent('click', { view: window});
    this.newShoppingListButton.nativeElement.dispatchEvent(event);
  }
  

    // When confirming that the shopping
  // process is done and a new shopping 
  // prcess can start.
  //
  
  onConfirmCheckout() {
    this.slcf['shopping_list_form'].enable();
    this.shoppingListService.isCheckoutConfirm = false;
    this.shoppingListService.isCheckout = false;
    this.shoppingListService.isCheckoutConfirm = false;
    this.saveShoppingListStatus();
    this.shoppingListService.checkoutShoppingList(
      this.shoppingListService.shoppingList.shopping_date, 
      this.shoppingListService.shoppingList.store_id, 
      this.shoppingListService.shoppingList.family_id)
      .subscribe({
        next: (v) => {
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
          this.slcf['shopping_list_form'].reset();
          this.onSelectShoppingList()
          this.shoppingListService.getAllDates(this.shoppingListService.shoppingList.family_id).subscribe((response: any) => {
            this.shoppingToSelectFrom = response;
            this.selectedShoppingList = true;
          });
      
        }
      })
  }

  onCancelCheckout() {
    this.slcf['shopping_list_form'].enable();
    this.shoppingListService.isCheckoutConfirm = false;
    this.shoppingListService.isCheckout = false;
    this.shoppingListService.isCheckoutConfirm = false;
    this.saveShoppingListStatus();

  }

  // When clicking the 'arrow going into the box' icon after it's
  // enable based on a selected shopping list, the shopping
  // process starts with changing the list by adding a check box
  // in front of each item on the list. The icon now changes
  // to 'check mark in square box', which means 'stop' shopping.
  //
  // The checkout is enabled next and when pressed, it can either
  // confirmed or cancelled.

  onShopping() {
    console.log('onShopping', this.shoppingListService.isShopping)
    //var shopping_status: string = "";

    if (this.shoppingListService.isShopping) {
      this.shoppingListService.isShopping = false;
      this.shoppingListService.isCheckout = true;
      //shopping_status = "stop";
      console.log('onShopping (change 1)', this.shoppingListService.isShopping)

    } else {
      this.shoppingListService.isShopping = true;
      //shopping_status = "start";
      console.log('onShopping (change 2)', this.shoppingListService.isShopping)
      this.slcf['shopping_list_form'].disable();
    }
    this.saveShoppingListStatus();
  }

  onCheckout() {
    this.shoppingListService.isCheckoutConfirm = true;
    this.shoppingListService.isCheckout = false;
    this.saveShoppingListStatus();
  }

  // The shopping status determine where in the process
  // of shopping a list is, i.e., start shopping, stop (done)
  // shopping, checkout (paying and going home).
  //
  // statusCode 0 : still adding items to the list
  //            1 : in the store shopping, checkoff the item in the cart
  //            2 : done and at the register
  //            3 : checked out (paid) and confirming

  saveShoppingListStatus() {
    var statusCode: number = 0;
    if (this.shoppingListService.isShopping && !this.shoppingListService.isCheckout && !this.shoppingListService.isCheckoutConfirm) {
      statusCode = 1;
    } else if (!this.shoppingListService.isShopping && this.shoppingListService.isCheckout && !this.shoppingListService.isCheckoutConfirm) {
      statusCode = 2;
    } else if (!this.shoppingListService.isShopping && !this.shoppingListService.isCheckout && this.shoppingListService.isCheckoutConfirm) {
      statusCode = 3;
    }
    this.shoppingListService.changeShoppingStatus(
      this.shoppingListService.shoppingList.shopping_date, 
      this.shoppingListService.shoppingList.store_id, 
      this.shoppingListService.shoppingList.family_id, 
      statusCode)
      .subscribe({
        next: (v) => {
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
        }
      })
  }

  loadShoppingListStatus(): number {
    //console.log('loadShoppingListStatus')
    this.shoppingListService.getShoppingListStatus(
      this.shoppingListService.shoppingList.shopping_date, 
      this.shoppingListService.shoppingList.store_id, 
      this.shoppingListService.shoppingList.family_id)
      .subscribe({
        next: (v) => {
          this.statusShoppingList = v['status'];
          if (this.statusShoppingList == 0) {
            this.shoppingListService.isShopping = false;
            this.shoppingListService.isCheckout = false;
            this.shoppingListService.isCheckoutConfirm = false;
          } else if (this.statusShoppingList == 1) {
            this.shoppingListService.isShopping = true;
            this.shoppingListService.isCheckout = false;
            this.shoppingListService.isCheckoutConfirm = false;
          } else if (this.statusShoppingList == 2) {
            this.shoppingListService.isShopping = false;
            this.shoppingListService.isCheckout = true;
            this.shoppingListService.isCheckoutConfirm = false;
          } else if (this.statusShoppingList == 3) {
            this.shoppingListService.isShopping = false;
            this.shoppingListService.isCheckout = false;
            this.shoppingListService.isCheckoutConfirm = true;
          }
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
          if (this.statusShoppingList > 0) {
            this.slcf['shopping_list_form'].disable();
          } else {
            this.slcf['shopping_list_form'].enable();
          }
          //console.log('loadShoppingListStatus', this.statusShoppingList)

          return this.statusShoppingList;
        }
      })
    return 0;
  }


  // When a shopping list is selected from the <Select Shopping List>,
  // then extract the the shopping_date and store_id to identify the
  // list for that store + date.
  //
  // Bases on the available categories to shop from, initialize the various
  // data sections, which are usually based on its category. So, there's
  // and array from [first_category, ..., last_category] and for each item
  // store what is on the list and what is available (or known) for that store.
  onSelectShoppingList() {
        //this.shoppingListService.hasStore = false;

       

        //initialize the shopping list
        // need to review
        for (let item in this.listCategory) {
          const list_category_id = this.listCategory[item]['list_category_id'];
          this.shoppingListService.shoppingListAll.delete(list_category_id);
          this.shoppingListService.shoppingListAllTotal.delete(list_category_id);
        }

        if (this.slf.value['shopping_list_form']) {

          this.shoppingListService.store = <Store>{
            store_id: this.slf.value['shopping_list_form'].store_id,
            name: this.slf.value['shopping_list_form'].name,            
          }

          this.shoppingListService.shoppingList = <ShoppingListDates>{
            shopping_date: this.slf.value['shopping_list_form'].shopping_date,
            store_id: this.slf.value['shopping_list_form'].store_id,
            name: this.slf.value['shopping_list_form'].name,
            family_id: this.authenticationService.familyMemberValue!.family_id
          }

          console.log('this.shoppingListService.shoppingList', this.shoppingListService.shoppingList)

          // load inventory for store
          this.inventoryService.loadInventoryByStore(this.shoppingListService.shoppingList.store_id);
          //console.log('storeInventory', this.shoppingListService.storeInventory);

          //this.shoppingListService.hasStore = true;

          //*** need to REVIEW THAT****/
          //this.selectedShoppingList = false;

          //console.log('onSelectShoppingList  --> store_id', this.store_id)
          //console.log('onSelectShoppingList  --> store', this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store'])

          for (let item in this.listCategory) {
            const list_category_id = this.listCategory[item]['list_category_id'];

            // The method performs the following:
            // (1) fills shoppingListAll contains all inventory items for a category on the shopping list
            // (2) fills shoppingListAllTotal (it's the summary of what the category contains
            //     and is the accordion's button: <category name>  <family member dots> <total number of items>)
            this.shoppingListService.getShoppingListByCategory(
              this.shoppingListService.shoppingList.shopping_date, 
              this.shoppingListService.shoppingList.store_id, 
              list_category_id);
            this.shoppingListService.getInventoryByCategory(this.shoppingListService.shoppingList.store_id, list_category_id);

            console.log('shoppingListAllTotal', this.shoppingListAllTotal);
            //console.log('shoppingListTotal', this.shoppingListTotal);

            // reset the formcontrol for selecting existing invenorty items
            // to be added to the shopping list
            //this.slcf['select_shopping_category'].patchValue(null);

            // uncheck all elements checkInventoryChecked(inventoryImage[inventoryItem.inventory_id])
            this.shoppingListService.inventoryImage.splice(0, this.shoppingListService.inventoryImage.length);

              
          
            //*** NEEDS TO BE REVIEWED *** */
            //this.loadShoppingListStatus();
            //this.iconPlusDash[list_category_id] = "bi-plus-circle";

          }
        }

  }



  //--- get ---
  get slcf(){
    return this.shoppinglistCntrlForm.controls;
  }


  get slf(){
    return this.shoppinglistCntrlForm;
  }

get shopping_date(){
  if( this.shoppingListService.shoppingList != undefined ) {
      return this.shoppingListService.shoppingList.shopping_date;
  }
  return null;
}

get isCheckout(){
  return this.shoppingListService.isCheckout;
} 
get isCheckoutConfirm(){
  return this.shoppingListService.isCheckoutConfirm;
}
get isShopping(){
  return this.shoppingListService.isShopping;
}


  onIconPlusMinus() {
    if (this.iconPlusMinus == "bi-plus") {
      this.iconPlusMinus = "bi-dash";
    } else {
      this.iconPlusMinus = "bi-plus";
    }
  }  
}
