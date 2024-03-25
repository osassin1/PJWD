import { Component, OnDestroy, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SafeUrl } from '@angular/platform-browser';


import { NgSelectModule } from '@ng-select/ng-select';




import { NavigationComponent } from '../navigation/navigation.component';
import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';

import { ShoppingListService } from './shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';


import { interval } from 'rxjs';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

// compression for pictures (jpeg, png); 
// if iOS is used then HEIC format needs to
// be converted to JPEG and then compressed
import { NgxImageCompressService } from 'ngx-image-compress';
import heic2any from "heic2any";


@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,
    NgSelectModule,
    NgStyle,
    NavigationComponent,
  ],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css',
})


export class ShoppinglistComponent implements OnInit, OnDestroy {


  isImageDisabled: boolean = false;
  isShopping: boolean = false;
  isCheckout: boolean = false;
  isCheckoutConfirm: boolean = false;
  statusShoppingList: number = 0;

  pollingTimeInSeconds: number = 5000;
  pollingData: any;
  pollingShoppedItems: any;

  stopPolling$ = new Subject<any>();

  private subChangeCategory: any;

  dateToday = new Date();

  selectShoppingListForm!: FormGroup;

  // gray filter applied to inventory items in shopping list
  inventoryImage: string[] = [];
  //inventoryColor: string[] = [];

  //selectedInventoryItem: any[] = [];
  selectedInventoryQuantity: number[] = [];


  selectedShoppingCategoryItem: any = "";

  // for n-select when clicking the circle-plus  
  selectInventoryByCategory: any[] = [];


  imageCompressMessage: string = "";

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

  // adding new shopping list via the 
  // icon (bi-plus) in the shopping list
  // change it to bi-dash when clicked
  iconPlusMinus: string = "bi-plus";

  // either uploaded or taken picture (mobil)
  selectedPicture: any[] = [];

  //newInventoryName: any[] = [];
  newInventoryQuantity: any[] = [];
  //newInventoryUnit: any[] = [];

  // determine if a store was selected
  hasStore: boolean = false;

  // get all stores that family/members can shop from
  storesToSelectFrom: any[] = [];

  // get all dates and store as existing shopping list
  shoppingToSelectFrom: any[] = [];

  // Once a shopping list has ben selected from the
  // available list in shoppingToSelectFrom, keep track 
  // with selectedShoppingList
  selectedShoppingList: any = "";

  // get all categories defined for the app
  listCategories: any[] = [];

  // this contains all inventory items on the shopping lisy by 
  // category, which is the key (string) for the Map<string, 
  // ShoppingListItems[]>. The array ShoppingListItems[] contains
  // the shopping item from inventory + quantity
  shoppingListAll: Map<number, ShoppingListInventory[]> = new Map<0, []>();

  // It's the summary/totals of each category, e.g.
  // who (family member) has items in this category, how many
  // items are there. There's also a total of units, which
  // might be to complicated when summing up item(s) and weights.
  shoppingListAllTotal: Map<number, ShoppingListTotal> = new Map<0, any>();

  // When changing item on a shopping list, then capture
  // the picture of the item to be changed and its current quantity 
  // and unit. In the case it's a new item, quantity might be 0 and
  // unit needs to be selected.
  selectedInventoryFlag: boolean[] = [];
  selectedInventoryPicture: any[] = [];
  selectedShoppingListQuantity: any[] = [];
  selectedInventoryUnit: any[] = [];

  // Bind the select box for items in a category
  // to an ngModel for two-way binding
  //selectedInventoryItemModel: string[] = [];

  // ok to take a picture to add to inventory
  takePicture: string[] = [];  //"ok|no|wait"

  private trigger: Subject<void> = new Subject<void>();

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService: InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private imageCompress: NgxImageCompressService,
  ) {
  }


  ngOnInit() {

    this.selectShoppingListForm = this.formBuilder.group({
      // the selected shopping list
      shopping_list_form: null,

      // for a new inventory item
      // these inputs can be made
      new_inventory_item_name: null,
      new_inventory_item_quantity: null,
      new_inventory_item_unit: null,
      new_inventory: null,

      // for existing inventory items, either already on
      // the list for for adding, only the quantity
      // can be entered
      adjust_quantity: null,

      // for selecting an inventory item in
      // a category
      select_shopping_category: null,

      image_upload: null,

      // create new shopping list
      newShoppingListDate: null,
      newShoppingListCard: null,

      storesToSelectFrom: null

    });


    const year = this.dateToday.getFullYear()

    let month: number | string = this.dateToday.getMonth() + 1
    let day: number | string = this.dateToday.getDate()

    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day

    var today = year + "-" + month + "-" + day;

    this.selectShoppingListForm.controls['newShoppingListDate'].setValue(today);

    // Get all defined shopping categories that can be used 
    // for a list. The identifier is list_category_id within
    // this component (and also database)
    this.shoppingListService.getListCatgory().subscribe((response: any) => {
      this.listCategories = response;

      // trying to initialize the accordion
      for (let item in this.listCategories) {
        const list_category_id = this.listCategories[item]['list_category_id'];
      }
    });

    // Get all shopping dates currently available; it's the content
    // for the first selector <Select Shopping List>

    this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
      this.shoppingToSelectFrom = response;
      this.selectedShoppingList = true; 
    });


    // get all shops that can be shoppedn from

    this.inventoryService.getListOfStores().subscribe((response: any) => {
      this.storesToSelectFrom = response;
      console.log('this.inventoryService.getListOfStores', this.storesToSelectFrom)
    });

    // no store is selected yet
    this.hasStore = false;

    this.pollingShoppedItems = this.shoppingListService.pollShoppedItemStatus()
      .subscribe((v) => {
        if (v && v['inventory_id']) {
          let inventoryList: number[] = v['inventory_id'];
          this.inventoryImage = [];
          inventoryList.forEach((inventory_id: number) => {
            this.inventoryImage[inventory_id] = "disabled";
          })
        }
      })

    this.subChangeCategory = interval(this.pollingTimeInSeconds)
      .subscribe(() => {
        let removeShoppingList = true;
        for (let item in this.listCategories) {
          const list_category_id = this.listCategories[item]['list_category_id'];
          this.shoppingListService.getListByCategoryByGroupCached(this.shopping_date, this.store_id, list_category_id, this.authenticationService.familyMemberValue!.family_id)
            .subscribe((res) => {
              if (res != null && this.shoppingListAll.get(list_category_id) != undefined ) {
                this.shoppingListAll.delete(list_category_id);
                this.shoppingListAllTotal.delete(list_category_id);
                this.shoppingListAll.set(list_category_id, res['inventory']);
                this.shoppingListAllTotal.set(list_category_id, res['category']);
                this.getInventoryByCategory(this.store_id, list_category_id);
              }
            })
        }
        this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
          this.shoppingToSelectFrom = response;
        });
        this.shoppingToSelectFrom.forEach(x=>{
          console.log('x',x,'removeShoppingList',removeShoppingList);
          console.log("this.selectShoppingListForm.controls['shopping_list_form'].value",this.selectShoppingListForm.controls['shopping_list_form'].value);

          if( this.selectShoppingListForm.controls['shopping_list_form'].value && this.selectShoppingListForm.controls['shopping_list_form'].value == x ) {
            console.log('found shopping date');
            removeShoppingList = false;
          }
        })

        if( removeShoppingList ) {
          console.log('removeShoppingList')
          //this.selectShoppingListForm.controls['shopping_list_form'].reset();
          //this.onSelectShoppingList()
        }


        this.loadShoppingListStatus();
      })
  }

  ngOnDestroy() {
    this.stopPolling$.next(null);
    this.pollingShoppedItems.unsubscribe();
    this.subChangeCategory.unsubscribe();
  }

  get fb() {
    return this.selectShoppingListForm;
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
    this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe({
      next: (v) => {
        this.hasStore = false;
        for (let item in this.listCategories) {
          const list_category_id = this.listCategories[item]['list_category_id'];
          this.shoppingListAll.delete(list_category_id);
          this.shoppingListAllTotal.delete(list_category_id);
        }

        if (this.selectShoppingListForm.value['shopping_list_form']) {
          this.shopping_date = this.selectShoppingListForm.value['shopping_list_form']['shopping_date'];
          this.store_id = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.store_id'];
          this.store_name = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.name'];

          this.hasStore = true;
          this.selectedShoppingList = false;

          for (let item in this.listCategories) {
            const list_category_id = this.listCategories[item]['list_category_id'];
            this.takePicture[list_category_id] = "ok"; //true; // can take pictures of that category

            // The method performs the following:
            // (1) fills shoppingListAll contains all inventory items for a category on the shopping list
            // (2) fills shoppingListAllTotal (it's the summary of what the category contains
            //     and is the accordion's button: <category name>  <family member dots> <total number of items>)
            this.getShoppingListByCategory(this.shopping_date, this.store_id, list_category_id);

            this.getInventoryByCategory(this.store_id, list_category_id);

            this.selectedInventoryFlag[list_category_id] = true;
            this.selectedInventoryPicture[list_category_id] = "";
            this.selectedShoppingListQuantity[list_category_id] = "";
            this.selectedInventoryUnit[list_category_id] = "";
            //this.selectedInventoryItem[list_category_id] =  null;

            // this is needed for new items to make the 
            // increase and decrease buttons work
            this.newInventoryQuantity[list_category_id] = 0;

            // reset the formcontrol for selecting existing invenorty items
            // to be added to the shopping list
            this.selectShoppingListForm.controls['select_shopping_category'].patchValue(null);

            // uncheck all elements checkInventoryChecked(inventoryImage[inventoryItem.inventory_id])
            this.inventoryImage.forEach((value, index) => {
              this.inventoryImage.splice(index, 1);
              //this.inventoryColor.splice(index,1);
            });

            this.loadShoppingListStatus();
            this.iconPlusDash[list_category_id] = "bi-plus-circle";
          }
        }
      }, error: (e) => {
        console.error("Error in selecting shopping list", e);
      }
    });
  }


  // ---- Confirm/Cancel Events -------------------------------------------------  
  // Handling of events associated with html components,
  // which start with 'on'. So, buttons' click event
  // is of the format: on<Confirm | Cancel)<some event>


  // When confirming or cancel a new shopping list
  // execute the following event 
  onConfirmAddNewShoppingList() {
    const [year, month, day] = this.selectShoppingListForm.controls['newShoppingListDate'].value.split("-")
    const newDateString = `${month}/${day}/${year}`;

    const newShoppingList = JSON.parse('{ "shopping_date": "' + newDateString +
      '", "shopping_list_to_family_member.family_id": "' + this.authenticationService.familyMemberValue!.family_id +
      '", "shopping_list_to_inventory.inventory_to_store.store_id": "' + this.selectShoppingListForm.controls['storesToSelectFrom'].value['store_id'] +
      '", "shopping_list_to_inventory.inventory_to_store.name": "' + this.selectShoppingListForm.controls['storesToSelectFrom'].value['name'] +
      '" } ');

    this.selectShoppingListForm.controls['shopping_list_form'].setValue(newShoppingList);
    this.onIconPlusMinus();
  }

  onCancelAddNewShoppingList() {
    console.log('onCancelAddNewShoppingList')
    this.onIconPlusMinus();
  }

  // When confirming that the shopping
  // process is done and a new shopping 
  // prcess can start.
  //
  
  onConfirmCheckout() {
    this.selectShoppingListForm.controls['shopping_list_form'].enable();
    this.isCheckoutConfirm = false;
    this.isCheckout = false;
    this.isCheckoutConfirm = false;
    this.saveShoppingListStatus();
    this.shoppingListService.checkoutShoppingList(this.shopping_date, this.store_id, this.authenticationService.familyMemberValue!.family_id)
      .subscribe({
        next: (v) => {
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
          this.selectShoppingListForm.controls['shopping_list_form'].reset();
          this.onSelectShoppingList()
          this.shoppingListService.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
            this.shoppingToSelectFrom = response;
            //this.selectedShoppingList = true;
          });
      
        }
      })
  }

  onCancelCheckout() {
    this.selectShoppingListForm.controls['shopping_list_form'].enable();
    this.isCheckoutConfirm = false;
    this.isCheckout = false;
    this.isCheckoutConfirm = false;
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
    var shopping_status: string = "";

    if (this.isShopping) {
      this.isShopping = false;
      this.isCheckout = true;
      shopping_status = "stop";

    } else {
      this.isShopping = true;
      shopping_status = "start";
      this.selectShoppingListForm.controls['shopping_list_form'].disable();
    }
    this.saveShoppingListStatus();
  }

  onCheckout() {
    this.isCheckoutConfirm = true;
    this.isCheckout = false;
    this.saveShoppingListStatus();
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

  onIconPlusMinus() {
    if (this.iconPlusMinus == "bi-plus") {
      this.iconPlusMinus = "bi-dash";
    } else {
      this.iconPlusMinus = "bi-plus";
    }
  }


  // when an inventory item was selected then capture the following
  // what is the picture, quantity (for that family member) and unit
  onSelectInventoryItem(list_category_id: number) {
    if (this.selectShoppingListForm.controls['select_shopping_category'].value !== null) {
      var inventory_id = this.selectShoppingListForm.controls['select_shopping_category'].value['inventory_id'];
      var quantity_symbol = this.selectShoppingListForm.controls['select_shopping_category'].value['quantity_symbol'];
      var quantity_unit = this.selectShoppingListForm.controls['select_shopping_category'].value['quantity_unit'];
      this.selectedInventoryFlag[list_category_id] = false;
      this.selectedInventoryPicture[list_category_id] = this.getPicture(inventory_id);
      this.selectedShoppingListQuantity[list_category_id] = this.getShoppingListQuantity(inventory_id, list_category_id);
      this.selectedInventoryUnit[list_category_id] = quantity_symbol;
    }
    this.selectShoppingListForm.controls['adjust_quantity'].setValue(this.getShoppingListQuantity(inventory_id, list_category_id));
  }



  // When opening a category in the shopping list,
  // store the category_id

  setListCategoryID(list_category_id: number) {
    this.list_category_id = list_category_id;
  }


  onStoreSelectChange() {

  }



  // When the clearAll (x) is being pressed within
  // the select: <Select inventory item>
  onClearQuantityChanges(list_category_id: number) {
    this.selectedInventoryFlag[list_category_id] = true;
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
    if (this.isShopping && !this.isCheckout && !this.isCheckoutConfirm) {
      statusCode = 1;
    } else if (!this.isShopping && this.isCheckout && !this.isCheckoutConfirm) {
      statusCode = 2;
    } else if (!this.isShopping && !this.isCheckout && this.isCheckoutConfirm) {
      statusCode = 3;
    }
    this.shoppingListService.changeShoppingStatus(this.shopping_date, this.store_id, this.authenticationService.familyMemberValue!.family_id, statusCode)
      .subscribe({
        next: (v) => {
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
        }
      })
  }

  loadShoppingListStatus(): number {
    this.shoppingListService.getShoppingListStatus(this.shopping_date, this.store_id, this.authenticationService.familyMemberValue!.family_id)
      .subscribe({
        next: (v) => {
          this.statusShoppingList = v['status'];
          if (this.statusShoppingList == 0) {
            this.isShopping = false;
            this.isCheckout = false;
            this.isCheckoutConfirm = false;
          } else if (this.statusShoppingList == 1) {
            this.isShopping = true;
            this.isCheckout = false;
            this.isCheckoutConfirm = false;
          } else if (this.statusShoppingList == 2) {
            this.isShopping = false;
            this.isCheckout = true;
            this.isCheckoutConfirm = false;
          } else if (this.statusShoppingList == 3) {
            this.isShopping = false;
            this.isCheckout = false;
            this.isCheckoutConfirm = true;
          }
        }, error: (e) => {
          console.error(e);
        }, complete: () => {
          if (this.statusShoppingList > 0) {
            this.selectShoppingListForm.controls['shopping_list_form'].disable();
          } else {
            this.selectShoppingListForm.controls['shopping_list_form'].enable();
          }
          return this.statusShoppingList;
        }
      })
    return 0;
  }

  // Load the shopping list by categories to match the accordion selector
  // and handle each section individually.
  getShoppingListByCategory(shopping_date: string, store_id: number, list_category_id: number) {

    this.shoppingListAll.delete(list_category_id);
    this.shoppingListAllTotal.delete(list_category_id);

    this.shoppingListService.getListByCategoryByGroup(shopping_date, store_id, list_category_id, this.authenticationService.familyMemberValue!.family_id)
      .subscribe({
        next: (v) => {
          this.shoppingListAll.set(list_category_id, v['inventory']);
          this.shoppingListAllTotal.set(list_category_id, v['category']);
        }, error: (e) => {
          console.error(e.error.message);
        },
        complete: () => {
          // load pictures, they will be cached in the
          // inventory service
          this.shoppingListAll.get(list_category_id)?.forEach((p => {
            this.inventoryService.loadPicture(p.inventory_id);
            this.inventoryService.loadInventory(store_id, p.inventory_id);
            if (p.shopping_status_id >= 2) {
              this.inventoryImage[p.inventory_id] = "disabled";
            }
          }));
        }
      });
  }


  // initialize the inventory items by category one can select from
  // click the circle-plus to open the selection of item in that category
  getInventoryByCategory(store_id: number, list_category_id: number) {
    this.inventoryService.getInventoryByCategory(store_id, list_category_id)
      .subscribe({
        next: (v) => {
          this.selectInventoryByCategory[list_category_id] = v;
          v.forEach((i: any) => {
            var inventory_id = i['inventory_id'];
            this.inventoryService.loadPicture(inventory_id);

          })
        }
      })
  }



  // Get the picture information as a string
  // from the inventory cache
  getPicture(inventory_id: number): SafeUrl {
    return this.inventoryService.pictureInventory.get(inventory_id) ?? "no_picture.jpg";
  }


  doIncreaseShoppingListQuantity(selectedShoppingListQuantity: any[], list_category_id: number) {
    if (selectedShoppingListQuantity[list_category_id] <= 49) {
      selectedShoppingListQuantity[list_category_id]++;
    }
  }

  doDecreaseShoppingListQuantity(selectedShoppingListQuantity: any[], list_category_id: number) {
    if (selectedShoppingListQuantity[list_category_id] - 1 >= 0) {
      selectedShoppingListQuantity[list_category_id]--;
    }
  }

  doUpdateQuantity(event: any, selectedShoppingListQuantity: any[], list_category_id: number) {
    if (event.target.value >= 0 && event.target.value <= 50) {
      selectedShoppingListQuantity[list_category_id] = event.target.value;
    }
  }





  // Make changes to an item on the shopping list (or to be added if doesn't exist yet)  
  // Once added then get the new item added to internal storage via getShoppingListByCategory
  //
  // If changes should not be applied, reset everything

  doMakeQuantityChanges(list_category_id: number) {
    this.shoppingListService.updateShoppingList(
      this.selectShoppingListForm.controls['shopping_list_form'].value["shopping_date"],
      this.authenticationService.familyMemberValue?.family_member_id || 0,
      this.selectShoppingListForm.controls['select_shopping_category'].value['inventory_id'],
      this.selectedShoppingListQuantity[list_category_id]).subscribe({
        next: (v) => {
        },
        error: (e) => {
          console.error('error', e);
        },
        complete: () => {
          this.getShoppingListByCategory(this.selectShoppingListForm.controls['shopping_list_form'].value["shopping_date"],
            this.selectShoppingListForm.controls['shopping_list_form'].value["shopping_list_to_inventory.inventory_to_store.store_id"],
            list_category_id);

          this.selectedInventoryFlag[list_category_id] = true;
          this.selectShoppingListForm.controls['select_shopping_category'].reset();  //patchValue(null);
        }
      });
  }

  doCancelQuantityChanges(list_category_id: number) {
    var inventory_id = this.selectShoppingListForm.controls['select_shopping_category'].value['inventory_id'];
    this.selectedShoppingListQuantity[list_category_id] = this.getShoppingListQuantity(inventory_id, list_category_id);
    this.selectedInventoryFlag[list_category_id] = true;
    this.selectShoppingListForm.controls['select_shopping_category'].reset();   // patchValue(null);
  }





  doAddNewInventoryItem(list_category_id: number) {
    var name: string = this.selectShoppingListForm.controls['new_inventory_item_name'].value;
    var quantity: number = this.newInventoryQuantity[list_category_id];
    var quantity_id: number = this.selectShoppingListForm.controls['new_inventory_item_unit'].value;
    var picture = this.selectedPicture[list_category_id];
    var store_id = this.store_id;
    var shopping_date: string = this.shopping_date;
    var inventory_id: number = 0;
    var family_member_id = this.authenticationService.familyMemberValue?.family_member_id || 0;

    this.inventoryService.createInventoryItemAddToShoppingList(
      name,
      picture,
      store_id,
      list_category_id,
      quantity_id,
      quantity,
      shopping_date,
      family_member_id
    ).subscribe({
      next: (v) => {
        inventory_id = v['inventory_id'];
        //this.loggingService.logEntry('doAddNewInventoryItem', 'inventory_id', inventory_id);
      },
      error: (e) => {
        console.error('error', e);
        //this.loggingService.logEntry('doAddNewInventoryItem', 'error', JSON.stringify(e) );        
        this.selectShoppingListForm.controls['new_inventory_item_name'].reset(null);
        this.selectShoppingListForm.controls['new_inventory_item_unit'].reset(null);
        this.newInventoryQuantity[list_category_id] = 0;
        this.selectedPicture[list_category_id] = null;
      },
      complete: () => {
        this.takePicture[list_category_id] = "ok";  // true
        this.getShoppingListByCategory(shopping_date, store_id, list_category_id);
        this.getInventoryByCategory(store_id, list_category_id);
        //this.loggingService.logEntry('doAddNewInventoryItem', 'complete', -1);      


        //formControlName="select_shopping_category"

        this.selectShoppingListForm.controls['new_inventory_item_name'].reset(null);
        this.selectShoppingListForm.controls['new_inventory_item_unit'].reset(null);
        this.newInventoryQuantity[list_category_id] = 0;
        this.selectedPicture[list_category_id] = null;

      }
    })

    this.takePicture[list_category_id] = "ok"; //false;
    this.isImageDisabled = false;

  }

  doDiscardNewInventoryItem(list_category_id: number) {
    //console.log('doDiscardNewInventoryItem')
    this.selectedPicture[list_category_id] = null;
    this.selectShoppingListForm.controls['new_inventory_item_name'].reset(null);
    this.selectShoppingListForm.controls['new_inventory_item_unit'].reset(null);
    this.selectShoppingListForm.controls['image_upload'].reset();
    this.newInventoryQuantity[list_category_id] = 0;
    this.takePicture[list_category_id] = "ok"; //false;
    this.isImageDisabled = false;
  }


  adjustForDecimals(x: any, unit: number) {
    if (unit == 2) {  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }


  // logout() {
  //   console.log('shoppinglist.component : logout');
  // }



  // getInventoryDefaultSelect(list_category_id: number) {
  //   var inventoryArray = this.inventoryService.categoryInventoryNew.get(list_category_id);

  //   if (inventoryArray == undefined || !inventoryArray) {
  //     return "Select inventory item";
  //   }
  //   console.log('inventoryArray[0]:', inventoryArray[0]);
  //   return inventoryArray[0];
  // }


  getShoppingListQuantity(inventory_id: number, list_category_id: number) {
    let quantity = 0;

    let index = this.shoppingListAll.get(list_category_id)?.findIndex(x => x.inventory_id == inventory_id);

    if (index == undefined) {
      return 0;
    }
    let fm = this.shoppingListAll.get(list_category_id);
    if (fm !== undefined && fm[index] !== undefined) {
      fm[index].family_members.forEach(m => {
        if (m.family_member_id == this.authenticationService.familyMemberValue?.family_member_id) {
          quantity = parseFloat(m.quantity);
        }
      })
    }

    //this.selectedInventoryQuantity[list_category_id] = quantity;

    return quantity;
  }

  // onSelectItem(itemId: string) {
  //   console.log('onSelectItem: ' + itemId);
  // }




  onCancelInventoryItem() {
    console.log('onCancelInventoryItem');
  }


  onCameraInventoryItem() {
    console.log('onCameraInventoryItem');
  }

  // doNothing(){

  // }


  checkInventoryItem(inventory_id: number) {
    if (this.inventoryImage[inventory_id] == "" || this.inventoryImage[inventory_id] == undefined) {
      this.inventoryImage[inventory_id] = "disabled";
      this.shoppingListService.shoppedItem(this.shopping_date, this.store_id, this.authenticationService.familyMemberValue!.family_id, inventory_id)
        .subscribe({
          next: (v) => {
          }, error: (e) => {
            console.error(e);
          }, complete: () => {
          }
        })
    } else {
      this.inventoryImage[inventory_id] = "";
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

  checkInventoryChecked(isActiveOrDisabled: any, inventory_id: number) {
    let retIsActiveOrDisabled: boolean = false;
    if (isActiveOrDisabled == undefined) {
      retIsActiveOrDisabled = false;
    } else {
      retIsActiveOrDisabled = (isActiveOrDisabled == "disabled");
    }
    return retIsActiveOrDisabled
  }



  // Either upload a picture from your computer or if mobile
  // take a picture that will be used

  triggerSnapshot(list_category_id: number): void {
    console.log('triggerSnapshot(list_category_id: number): void');
    this.list_category_id = list_category_id;
    this.trigger.next();
  }


  imageLength(image: string) {
    return image.length;
  }

  imageSelectCancel(list_category_id: number) {
    //this.isImageDisabled = true;
    console.log('imageSelectCancel')
    this.takePicture[list_category_id] == "wait"
    this.doDiscardNewInventoryItem(list_category_id);
  }

  imageSelected($event: any, list_category_id: number) {
    //console.log("imageSelected", $event);
    this.isImageDisabled = true;

    if (this.takePicture[list_category_id] == "wait") {
      console.error('this.takePicture[list_category_id]', this.takePicture[list_category_id]);
      return;
    }
    this.imageCompressMessage = "<start>";
    this.takePicture[list_category_id] = "wait";

    const fileName = $event.target.files[0];
    if (typeof fileName.size === undefined) {
      console.error('no file selected');
      return;
    }
    console.log("size", fileName.size);
    console.log("type", fileName.type);

    let blob: Blob = fileName;
    let file: File = fileName;


    let convProm: Promise<any>;

    if (/image\/hei(c|f)/.test(fileName.type) || fileName.type == "") {
      console.log('heic');
      convProm = heic2any({ blob: fileName, toType: "image/jpeg", quality: 0 }).then((jpgBlob: any) => {
        console.log('(1) jpgBlob', jpgBlob);
        this.imageCompressMessage += "<t:heic->jpeg>,"
        let newName = fileName.name.replace(/\.[^/.]+$/, ".jpg");
        file = this.blobToFile(jpgBlob, newName);
        //this.selectedPicture[list_category_id] = jpgBlob as string;
      }).catch(err => {
        //Handle error
      });
    } else {
      console.log('type', fileName.type);
      //This is not a HEIC image so we can just resolve
      convProm = Promise.resolve(true);

      this.imageCompressMessage += "<t:" + fileName.type + ">,";
      const file = new FileReader();
      file.readAsDataURL(fileName);
      file.onload = () => {
        this.selectedPicture[list_category_id] = file.result as string;
        this.imageCompress.compressFile(file.result as string, 0, 100, 100, 200, 200).then(
          compressedImage => {
            this.selectedPicture[list_category_id] = compressedImage;
          }
        )
        this.imageCompressMessage += "<c:" + this.selectedPicture[list_category_id].length + ">,";
      }

    }

    convProm.then(() => {

      let reader = new FileReader();
      let _thisComp = this;

      //Add file to FileReader
      if (file) {
        reader.readAsDataURL(file);
      }
      //Listen for FileReader to get ready
      reader.onload = function () {

        //Set imageUrl. This will trigger initialization of cropper via imageLoaded() 
        //as configured in the html img tag:
        //<img #image id="image" [src]="imageUrl" (load)="imageLoaded($event)" class="cropper"> 

        //_thisComp.imageUrl = reader.result;
        _thisComp.selectedPicture[list_category_id] = reader.result;
        _thisComp.imageCompress.compressFile(reader.result as string, 0, 100, 100, 200, 200).then(
          compressedImage => {
            _thisComp.selectedPicture[list_category_id] = compressedImage;
            _thisComp.imageCompressMessage += "<c:" + _thisComp.selectedPicture[list_category_id].length + ">,";
          }
        )

      }
    });

    this.takePicture[list_category_id] = "wait";
    this.imageCompressMessage += "<end>"
    this.newInventoryQuantity[list_category_id] = 1;

    this.selectShoppingListForm.controls['new_inventory_item_quantity'].setValue(1);
    this.selectShoppingListForm.controls['new_inventory_item_unit'].setValue(3);   // item(s)



  }
  private blobToFile = (theBlob: Blob, fileName: string): File => {
    let b: any = theBlob;

    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModified = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }



}
