import { Component, ElementRef, OnDestroy, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
//import { SafeUrl } from '@angular/platform-browser';

import { NgSelectModule } from '@ng-select/ng-select';

import { NavigationComponent } from '../navigation/navigation.component';
import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';

import { ShoppingListService } from './shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { ShoppinglistEditComponent } from '../shoppinglist-edit/shoppinglist-edit.component';
import { ShoppinglistAddComponent } from '../shoppinglist-add/shoppinglist-add.component';
import { ShoppinglistCntrlComponent } from '../shoppinglist-cntrl/shoppinglist-cntrl.component';
import { AuthenticationService } from '../authentication/authentication.service';

//import { Inventory } from '../models/inventory.model'

import { interval } from 'rxjs';
//import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { ListCategory } from '../models/list_category.model';

// compression for pictures (jpeg, png); 
// if iOS is used then HEIC format needs to
// be converted to JPEG and then compressed
//import { NgxImageCompressService } from 'ngx-image-compress';
//import heic2any from "heic2any";

@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,
    NgSelectModule,
    NgStyle,
    NavigationComponent,
    ShoppinglistEditComponent,
    ShoppinglistAddComponent,
    ShoppinglistCntrlComponent
  ],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css',
})


export class ShoppinglistComponent implements OnInit, OnDestroy {

  // @ViewChild('newShoppingList', { static: false }) newShoppingListButton!: ElementRef;

  newInventoryDisplay: boolean = true;
  isInventoryEdit: boolean[] = [];

  // turn on/off monitoring of changes
  isMonitorOn: boolean = false;

  // isImageDisabled: boolean = false;
   //isShopping: boolean = false;


  // monitoring changes
  private subChangeCategory: any;
  pollingTimeInSeconds: number = 5000;
  //pollingData: any;
  pollingShoppedItems: any;

  
 
  selectShoppingListForm!: FormGroup;

  // Take a note that a new shopping list has
  // been created but not stored yet, it will
  // only be stored once an inventory item is
  // added (no race condition if another family
  // member creates the same list - it's family
  // member independent)
  newShoppingListCreated = false;

  // // gray filter applied to inventory items in shopping list
  // inventoryImage: string[] = [];

  selectedShoppingCategoryItem: any = "";

  // // for n-select when clicking the circle-plus  
  // selectInventoryByCategory: any[] = [];

  // The current shopping date, store and what's on
  // the list:
  shopping_date: string = "";
  store_id: number = 0;
  store_name: string = "";
  list_category_id: number = 0;


  // adding new inventory items via the 
  // icon (bi-plus-circle) in the shopping list
  // change it to bi-dash-circle when clicked
  iconPlusDash: string[] = [];

  // // adding new shopping list via the 
  // // icon (bi-plus) in the shopping list
  // // change it to bi-dash when clicked
  // iconPlusMinus: string = "bi-plus";





  storeInventoryByCategory: any[] = [];

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService: InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    //private imageCompress: NgxImageCompressService,
  ) {
  }


  ngOnInit() {
    this.selectShoppingListForm = this.formBuilder.group({
      // the selected shopping list
      shopping_list_form: null,

      // for selecting an inventory item in
      // a category
      select_shopping_category: null,

    });

  //   this.shoppingListService.shoppingListDates.subscribe((y=>{
  //     console.log('ShoppinglistComponent --> subscribed to shoppingListDate y=', y)
  // }))

    this.inventoryService.getListCatgory().subscribe((response: any) => {
      response.forEach((x:ListCategory) => {
        this.iconPlusDash[x.list_category_id] = "bi-plus-circle";
      })
    })


    if( this.isMonitorOn ) {
    
      // this.pollingShoppedItems = this.shoppingListService.pollShoppedItemStatus()
      //   .subscribe((v) => {
      //     if (v && v['inventory_id']) {
      //       let inventoryList: number[] = v['inventory_id'];
      //       this.shoppingListService.inventoryImage = [];
      //       inventoryList.forEach((inventory_id: number) => {
      //         this.shoppingListService.inventoryImage[inventory_id] = "disabled";
      //       })
      //     }
      //   })

      this.subChangeCategory = interval(this.pollingTimeInSeconds)
        .subscribe(() => {
          let removeShoppingList = true;
          for (let item in this.listCategory) {
            const list_category_id = this.listCategory[item]['list_category_id'];
            this.shoppingListService.getListByCategoryByGroupCached(this.shopping_date, this.store_id, list_category_id, this.authenticationService.familyMemberValue!.family_id)
              .subscribe((res) => {
                if (res != null && this.shoppingListService.shoppingListAll.get(list_category_id) != undefined ) {
                  // this.shoppingListAll.delete(list_category_id);
                  this.shoppingListService.shoppingListAllTotal.delete(list_category_id);
                  //this.shoppingListAll.set(list_category_id, res['inventory']);
                  this.shoppingListService.shoppingListAllTotal.set(list_category_id, res['category']);

                  const inventory = res['inventory'];

                  this.updateListInventory(this.shoppingListService.shoppingListAll.get(list_category_id)!, res['inventory'], list_category_id);

                  this.shoppingListService.getInventoryByCategory(this.store_id, list_category_id);
                }
              })
          }
          this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
            this.shoppingListService.shoppingToSelectFrom = response;
          });

          // it needs to to be synced amongst all family_members
          // the event of checking out mut be propergated to all active
          // sessions
          this.shoppingListService.shoppingToSelectFrom.forEach((x:any)=>{
            if( this.selectShoppingListForm.controls['shopping_list_form'].value && 
                this.selectShoppingListForm.controls['shopping_list_form'].value['shopping_date'] == x['shopping_date'] &&
                this.selectShoppingListForm.controls['shopping_list_form'].value['shopping_list_to_inventory.inventory_to_store.store_id'] == 
                x['shopping_list_to_inventory.inventory_to_store.store_id'] ) {

              removeShoppingList = false;
              if(this.newShoppingListCreated) {  
                this.newShoppingListCreated = false;  // a new shopping list that was created, is now stored
              }
            }
          })

          if( !this.newShoppingListCreated && removeShoppingList ) {
            this.resetShoppingState();
            this.selectShoppingListForm.controls['shopping_list_form'].reset();

            //*** NEED REVIEW  */
            //this.onSelectShoppingList()
          }
          //***** NEED REVIEW */
          //this.loadShoppingListStatus();
        })
      }
  }

  updateListInventory(localInventory: ShoppingListInventory[], remoteInventory: ShoppingListInventory[], list_category_id: number) { 

    //this.selectInventoryByCategory[list_category_id]
    let madeChanges: boolean = false;

    localInventory.forEach(li=>{
      const item = remoteInventory.find((item)=>item.inventory_id == li.inventory_id);

      // if another family member removed an item from the list (remote)
      // we also need to update our local list.
      if( item == undefined ) {
        const itemNo = localInventory.findIndex((item)=>item.inventory_id == li.inventory_id);
        localInventory.splice(itemNo, 1);
        madeChanges = true;
      }

      // if some changes happended to name or notes or quantity or number of items
      // we need to refresh the local list
      if( !madeChanges ) {
        if( item?.name != li.name || item.notes != li.notes || item.quantity != li.quantity  || item.num_of_items != li.num_of_items ) {
          let indexForUpdate = localInventory.findIndex((item)=>item.inventory_id == li.inventory_id);
          const picture = li.picture;  // remember the pciture
          localInventory[indexForUpdate] = item!;
          localInventory[indexForUpdate].picture = picture;
          madeChanges = true;
        }
      }
     })

      // if the remote list has additional (new) items, then we need to update the local list
      remoteInventory.forEach(ri=>{
          const item = localInventory.findIndex((item)=>item.inventory_id == ri.inventory_id);
          if( item == -1 ){
            ri.picture = this.inventoryService.loadPicture(ri.inventory_id);
            localInventory.push(ri);
            madeChanges = true;
          }
      })

      return madeChanges;
  }


  ngOnDestroy() {
    if( this.isMonitorOn ) {
      //this.stopPolling$.next(null);
      this.pollingShoppedItems.unsubscribe();
      this.subChangeCategory.unsubscribe();
    }
  }

  get fb() {
    return this.selectShoppingListForm;
  }

  // this controls the graying out of the shopping list item
  // when the checkbox is checked.
  get inventoryImage(){
    return this.shoppingListService.inventoryImage;
  }

  get shoppingList(){
    //console.log('this.shoppingListService.shoppingList',this.shoppingListService.shoppingList)
    return this.shoppingListService.shoppingList;
  }


// after checkout or synced checkout, reset
// state of the shopping app  
resetShoppingState(){

  // no store has been selected
  //this.hasStore = false;

  // no shopping list has been selected
  // and the selector is active
  // *** MIGHT NEED THAT ***
  //this.selectedShoppingList = true;

  // current selection needs to be reset
  this.shopping_date = "";
  this.store_id = 0;
  this.store_name = "";
  this.list_category_id = 0;
}



onInventoryEdit(item: ShoppingListInventory){
  item.picture = this.getPicture(item.inventory_id);
  this.isInventoryEdit[item.inventory_id] = !this.isInventoryEdit[item.inventory_id];
}

//(inventory_id)="onInventoryID($id)">

onInventoryID($id: any){
  console.log('shoppinglist::this.isInventoryEdit[$id]', this.isInventoryEdit[$id], $id )
  // only display item (turn off edit mode)
  //this.inventoryService.loadPicture($id);
  this.isInventoryEdit[$id] = false;
}


onInventoryEditDone($event: any){
  console.log('shoppinglist::onInventoryEditDone', $event )

  // If true then either the quantity changed or a new inventory
  // item was created and added to the list. Update by fetching everything 
  // in this catgeory for current the shopping list and inventory for
  // that store.
  if( $event ){
    this.shoppingListService.getShoppingListByCategory(
      this.shoppingList.shopping_date,
      this.shoppingList.store_id,
      this.shoppingList.family_id,
      this.list_category_id
    );

    this.shoppingListService.getInventoryByCategory(
      this.shoppingList.store_id, 
      this.list_category_id
    ); 


    // This is only necessary when a new shopping list
    // has been created.
    this.shoppingListService.getAllShoppingDates(
      this.authenticationService.familyMemberValue!.family_id
    );
  }
}


onShoppinglistCtrlDone($event:any){
  console.log('onShoppinglistCtrlDone', $event)
  if( $event ) {
    //this.newShoppingListCreated = true; 
    //this.selectShoppingListForm.controls['shopping_list_form'].setValue(this.shoppingListService.shoppingList);
  }
  else {
    //this.newShoppingListCreated = false;
  }

  // this will 'click' on the add (+/-) button
  // const event = new MouseEvent('click', { view: window});
  // this.newShoppingListButton.nativeElement.dispatchEvent(event);
}


  // Changing icons when clicking one, for example,
  // circle (+) should change to circle (-),
  // + should change to -,
  // camera should change to disabled camera

  onIconPlusDash(list_category_id: number) {
    if (this.iconPlusDash[list_category_id] == "bi-plus-circle") {
      this.iconPlusDash[list_category_id] = "bi-dash-circle";
    } else {
      this.iconPlusDash[list_category_id] = "bi-plus-circle";
    }
  }


  // When opening a category in the shopping list,
  // store the category_id

  setListCategoryID(list_category_id: number) {
    this.list_category_id = list_category_id;
  }


  get familyMemberID(){
    return this.shoppingListService.familyMemberID;
  }

  get shoppingDate(){
    return this.shopping_date;
  }

  get selectInventoryByCategory(){
    return this.shoppingListService.selectInventoryByCategory;
  }

  get inventoryBackground(){
    return "bg-inventory";
  }



//--- get ---

// InventoryService has all inventory items for a store by store_id
get storeInventory(){
  return this.inventoryService.storeInventory;
}

get shoppingListAllTotal(){
  return this.shoppingListService.shoppingListAllTotal;
}

get shoppingListAll(){
  return this.shoppingListService.shoppingListAll;
}

get listCategory(){
  return this.shoppingListService.listCategory;
}

get isShopping(){
  return this.shoppingListService.isShopping;
}
  getInventoryByCategory2(list_category_id: number){
    return this.shoppingListService.selectInventoryByCategory[list_category_id];
  }



  // Get the picture information as a string
  // from the inventory cache
  getPicture(inventory_id: number) {
    return this.inventoryService.pictureInventory.get(inventory_id) ?? "no_picture.jpg";
  }


  adjustForDecimals(x: any, unit: number) {
    if (unit == 2) {  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }


// --- Shopping ---
// The list is ready to be shopped, for that purpose, items can be checked-off
// on the list, indicating that they are in the cart now. If the checkmark is
// removed then the item is no longer in the cart. Items that are in the cart 
// will be grayed out.

// Update the status of items being in the process of being shopped and
// set variables according to that status. With inventoryImage[inventory_id] = "disabled"
// the item will be grayed out.

checkInventoryItem(inventory_id: number) {
  if (this.shoppingListService.inventoryImage[inventory_id] == "" || this.shoppingListService.inventoryImage[inventory_id] == undefined) {
    this.shoppingListService.inventoryImage[inventory_id] = "disabled";
    this.shoppingListService.shoppedItem(this.shopping_date, this.store_id, this.authenticationService.familyMemberValue!.family_id, inventory_id)
      .subscribe({
        next: (v) => {
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
        }
      })
  } else {
    this.shoppingListService.inventoryImage[inventory_id] = "";
    this.shoppingListService.unShoppedItem(this.shopping_date, this.store_id, this.authenticationService.familyMemberValue!.family_id, inventory_id)
      .subscribe({
        next: (v) => {
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
        }
      })

  }
}

// A helper function that goes along with checkInventoryItem
// the status is kept in inventoryImage[inventory_id]
checkInventoryChecked(isActiveOrDisabled: any, inventory_id: number) {
  let retIsActiveOrDisabled: boolean = false;
  if (isActiveOrDisabled == undefined) {
    retIsActiveOrDisabled = false;
  } else {
    retIsActiveOrDisabled = (isActiveOrDisabled == "disabled");
  }
  return retIsActiveOrDisabled
}

}
