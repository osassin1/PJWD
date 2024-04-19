import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { ShoppingListService } from '../shoppinglist/shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';

import { ShoppinglistNewComponent } from '../shoppinglist-new/shoppinglist-new.component';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { Store } from '../models/store.model';
import { interval } from 'rxjs';

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

export class ShoppinglistCntrlComponent implements OnInit, OnDestroy {

  @ViewChild('newShoppingList', { static: false }) newShoppingListButton!: ElementRef;

  @Input() background: any;

  currentShoppingList!: ShoppingListDates;
  shoppinglistCntrlForm!: FormGroup;

  // adding new shopping list via the 
  // icon (bi-plus) in the shopping list
  // change it to bi-dash when clicked
  iconPlusMinus: string = "bi-plus";

  // Take a note that a new shopping list has
  // been created but not stored yet, it will
  // only be stored once an inventory item is
  // added (no race condition if another family
  // member creates the same list - it's family
  // member independent)
  newShoppingListCreated: boolean = false;

  statusShoppingList: number = 0;

  editInventoryLock: boolean = false;

  // Monitor changes in shopping lists
  pollingTimeInMilliSeconds: number = 5000;
  monitorChangeShoppingList: any;

  constructor(
    private shoppingListService: ShoppingListService,
    private authenticationService: AuthenticationService,
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder) {
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
      //console.log('this.shoppingToSelectFrom', this.shoppingToSelectFrom)
      //console.log('this.shoppingListService.shoppingList', this.shoppingListService.shoppingList)
    });

    this.authenticationService.familyMember.subscribe((f) => {
      console.log('this.authenticationService.familyMember in Shoppinglist-CNTRL --> f', f)
    })

    this.shoppingListService.shoppingListDoneObservable.subscribe(x => {
      console.log('this.shoppingListService.shoppingListDoneObservable', x)
    })

    this.shoppingListService.editInventoryLockObservable.subscribe((res: boolean) => {
      //console.log('ShoppinglistAddComponent::OnInit editInventoryLock:', res)
      if (this.editInventoryLock != res) {
        this.editInventoryLock = res;
      }
    })

    this.monitorChangeShoppingList = interval(this.pollingTimeInMilliSeconds)
      .subscribe(() => {
        this.monitorChangesShoppingList();
      })

  }

  ngOnDestroy(){
    this.monitorChangeShoppingList.unsubscribe();
  }

  get shoppingToSelectFrom() {
    return this.shoppingListService.shoppingToSelectFrom;
  }

  get selectedShoppingList() {
    return this.shoppingListService.selectedShoppingList;
  }

  set shoppingToSelectFrom(s: any) {
    this.shoppingListService.shoppingToSelectFrom = s;
  }

  set selectedShoppingList(s: any) {
    this.shoppingListService.selectedShoppingList = s
  }

  get listCategory() {
    return this.shoppingListService.listCategory;
  }
  set listCategory(s: any) {
    this.shoppingListService.listCategory = s;
  }

  get shoppingListAllTotal() {
    return this.shoppingListService.shoppingListAllTotal;
  }

  get shoppingList() {
    return this.shoppingListService.shoppingList;
  }


  onShoppinglistNewDone($event: any) {
    if ($event) {
      this.slcf['shopping_list_form'].setValue(this.shoppingListService.shoppingList);
      this.newShoppingListCreated = true;
    }

    // this will 'click' on the add (+/-) button
    const event = new MouseEvent('click', { view: window });
    this.newShoppingListButton.nativeElement.dispatchEvent(event);
  }

  onShoppingListNew($event: any) {
    //console.log('ShoppinglistCntrlComponent --> any:', $event)

    this.shoppingListService.shoppingList = $event;
    this.slcf['shopping_list_form'].reset();
    this.slcf['shopping_list_form'].setValue($event);
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
          //          this.shoppingListService.shoppingListRemovedObservable.
          //this.onSelectShoppingList()

          this.shoppingListService.getAllShoppingDates(
            this.shoppingListService.shoppingList.family_id
          );

          this.shoppingListService.shoppingList = <ShoppingListDates>{
            shopping_date: "",
            store_id: 0,
            name: "",
            family_id: this.authenticationService.familyMemberValue!.family_id
          }

          this.shoppingListService.store = <Store>{
            store_id: 0,
            name: "",
          }
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
    // console.log('onShopping', this.shoppingListService.isShopping)
    //var shopping_status: string = "";

    if (this.shoppingListService.isShopping) {
      this.shoppingListService.isShopping = false;
      this.shoppingListService.isCheckout = true;
      // console.log('onShopping (change 1)', this.shoppingListService.isShopping)

    } else {
      this.shoppingListService.isShopping = true;
      // console.log('onShopping (change 2)', this.shoppingListService.isShopping)
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

  loadShoppingListStatus(shoppingList: ShoppingListDates): number {

    if (shoppingList == undefined) {
      console.error('loadShoppingListStatus NO shoppingList')
      return 0;
    }

    this.shoppingListService.getShoppingListStatus(
      shoppingList.shopping_date,
      shoppingList.store_id,
      shoppingList.family_id)
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
    if (this.slf.value['shopping_list_form']) {

      this.shoppingListService.store = <Store>{
        store_id: this.slf.value['shopping_list_form'].store_id,
        name: this.slf.value['shopping_list_form'].name,
      }

      const tempShoppingList = <ShoppingListDates>{
        shopping_date: this.slf.value['shopping_list_form'].shopping_date,
        store_id: this.slf.value['shopping_list_form'].store_id,
        name: this.slf.value['shopping_list_form'].name,
        family_id: this.authenticationService.familyMemberValue!.family_id
      }

      // Check if the two objects are different by comparing their string
      // representation. It's a simple way to compare two objects.
      if (JSON.stringify(tempShoppingList) != JSON.stringify(this.shoppingListService.shoppingList)) {
        this.shoppingListService.shoppingList = tempShoppingList;
        this.loadShoppingListStatus(tempShoppingList);
      }
    }

  }

  monitorChangesShoppingList() {
    if( !this.authenticationService.familyMemberValue ){
      return;
    }
    this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
      this.shoppingToSelectFrom = response;
    });

    if (this.shoppingList != undefined) {
      this.loadShoppingListStatus(this.shoppingList);
    }

    let removeShoppingList = true;
    // it needs to to be synced amongst all family_members
    // the event of checking out mut be propergated to all active
    // sessions
    this.shoppingToSelectFrom.forEach((x: ShoppingListDates) => {
      if (this.slf.value['shopping_list_form'] &&
        this.slf.value['shopping_list_form'].shopping_date == x.shopping_date &&
        this.slf.value['shopping_list_form'].store_id == x.store_id
      ) {

        removeShoppingList = false;
        if (this.newShoppingListCreated) {
          this.newShoppingListCreated = false;  // a new shopping list that was created, is now stored
        }
      }
    })
    if (!this.newShoppingListCreated && removeShoppingList) {
      this.shoppingListService.isCheckoutConfirm = false;
      this.shoppingListService.isCheckout = false;
      this.slf.reset();

      this.shoppingListService.shoppingList = <ShoppingListDates>{
        shopping_date: "",
        store_id: 0,
        name: "",
        family_id: this.authenticationService.familyMemberValue!.family_id
      }

      this.shoppingListService.store = <Store>{
        store_id: 0,
        name: "",
      }
    }
  }

  //--- get ---
  get slcf() {
    return this.shoppinglistCntrlForm.controls;
  }


  get slf() {
    return this.shoppinglistCntrlForm;
  }

  get shopping_date() {
    if (this.shoppingListService.shoppingList != undefined) {
      return this.shoppingListService.shoppingList.shopping_date;
    }
    return null;
  }

  get isCheckout() {
    return this.shoppingListService.isCheckout;
  }
  get isCheckoutConfirm() {
    return this.shoppingListService.isCheckoutConfirm;
  }
  get isShopping() {
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
