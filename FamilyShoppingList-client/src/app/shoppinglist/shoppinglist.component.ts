import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgStyle } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { NavigationComponent } from '../navigation/navigation.component';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { ListCategory } from '../models/list_category.model';

import { ShoppingListService } from './shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { ShoppinglistEditComponent } from '../shoppinglist-edit/shoppinglist-edit.component';
import { ShoppinglistAddComponent } from '../shoppinglist-add/shoppinglist-add.component';
import { ShoppinglistCntrlComponent } from '../shoppinglist-cntrl/shoppinglist-cntrl.component';
import { AuthenticationService } from '../authentication/authentication.service';


@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,
    NgSelectModule,
    NgbModule,
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

  newInventoryDisplay: boolean = true;

  // Array of booleans to keep track which item is in edit mode
  isInventoryEdit: boolean[] = [];

  // item.list_category_id
  showShoppingListCard: boolean[] = [];

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

  // // gray filter applied to inventory items in shopping list
  // inventoryImage: string[] = [];

  selectedShoppingCategoryItem: any = "";

  // // for n-select when clicking the circle-plus  
  // selectInventoryByCategory: any[] = [];

  // The current shopping date, store and what's on
  // the list:
  list_category_id: number = 0;


  // adding new inventory items via the 
  // icon (bi-plus-circle) in the shopping list
  // change it to bi-dash-circle when clicked
  iconPlusDash: string[] = [];

  // // adding new shopping list via the 
  // // icon (bi-plus) in the shopping list
  // // change it to bi-dash when clicked
  // iconPlusMinus: string = "bi-plus";



  //onAccordionCollapse: any;
  //storeInventoryByCategory: any[] = [];

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService: InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
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

    this.shoppingListService.shoppingListDoneObservable.subscribe(x => {
      // If shopping list has been checkedout and is done
      if (x) {
        this.shoppingListService.listCategory.forEach((l: ListCategory) => {
          this.showShoppingListCard[l.list_category_id] = true;
        })
      }
    })

    this.inventoryService.getListCatgory().subscribe((response: any) => {
      response.forEach((x: ListCategory) => {
        this.iconPlusDash[x.list_category_id] = "bi-plus-circle";
        this.showShoppingListCard[x.list_category_id] = true;
      })
    })

    // The observable editInventoryLockObservable is used to let all 
    // components know that an inventory has been selected for editing
    // and all other interactions are paused until the editing is complete. 
    this.shoppingListService.editInventoryLockObservable.subscribe((res: boolean) => {
      this.shoppingListService.lockInventoryEdit = res;

      // Child components can change the lock but
      // the parent's change detection already completed,
      // therefore, the service shared the lock with all
      // components. But the parent still needs to invoke
      // change detection
      this.cd.detectChanges();
    })

    // Changes to the logged in family member, e.g., logout could
    // be processed here, however, there's no clear for that right now.
    // --> It could be deleted?
    this.authenticationService.familyMember.subscribe((f) => {
      console.log('this.authenticationService.familyMember in Shoppinglist --> f', f)
    })

  }

  // Clean up when component goes away, e.g., family member changes
  // to logout.
  ngOnDestroy() {
    if (this.isMonitorOn) {
      this.pollingShoppedItems.unsubscribe();
      this.subChangeCategory.unsubscribe();
    }
  }

  // By clicking on an inventory item on the shopping list by
  // category, this invokes the shoppinglist-edit component by
  // toggling 'isInventoryEdit[item.inventory_id]'. 
  onInventoryEdit(item: ShoppingListInventory) {
    item.picture = this.getPicture(item.inventory_id);
    this.isInventoryEdit[item.inventory_id] = !this.isInventoryEdit[item.inventory_id];

    // Item form the shopping list is active for editing
    // only one item should be worked on at the same time.
    // Changing this will emit the value to all subscribers
    // including the one set in ngOnInit
    this.shoppingListService.changeEditInventoryLock(true);
  }

  // Callback method used for the shoppinglist-edit component when
  // it had been called. Once the editing is done, toggle it back to.
  onInventoryID($id: any) {
    this.isInventoryEdit[$id] = false;
  }

  // Callback method used for the shoppinglist-edit component when
  // it had been called. If something changed then update the shopping
  // list and inventory.
  onInventoryEditDone($event: any) {

    // If true then either the quantity changed or a new inventory
    // item was created and added to the list. Update by fetching everything 
    // in this catgeory for current the shopping list and inventory for
    // that store.
    if ($event) {
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
    this.shoppingListService.changeEditInventoryLock(false);
  }


  // onShoppinglistCtrlDone($event:any){
  //   //console.log('onShoppinglistCtrlDone', $event)
  //   if( $event ) {
  //     //this.newShoppingListCreated = true; 
  //     //this.selectShoppingListForm.controls['shopping_list_form'].setValue(this.shoppingListService.shoppingList);
  //   }
  //   else {
  //     //this.newShoppingListCreated = false;
  //   }

  //   // this will 'click' on the add (+/-) button
  //   // const event = new MouseEvent('click', { view: window});
  //   // this.newShoppingListButton.nativeElement.dispatchEvent(event);
  // }


  // Changing icons when clicking one, for example,
  // circle (+) should change to circle (-),
  // + should change to -,
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

  //--- get ---
  // InventoryService has all inventory items for a store by store_id
  get storeInventory() {
    return this.inventoryService.storeInventory;
  }

  get shoppingListAllTotal() {
    return this.shoppingListService.shoppingListAllTotal;
  }

  get shoppingListAll() {
    return this.shoppingListService.shoppingListAll;
  }

  get listCategory() {
    return this.shoppingListService.listCategory;
  }

  get isShopping() {
    return this.shoppingListService.isShopping;
  }

  get familyMemberID() {
    return this.shoppingListService.familyMemberID;
  }

  get selectInventoryByCategory() {
    return this.shoppingListService.selectInventoryByCategory;
  }

  get inventoryBackground() {
    return "bg-inventory";
  }

  get fb() {
    return this.selectShoppingListForm;
  }

  // this controls the graying out of the shopping list item
  // when the checkbox is checked.
  get inventoryImage() {
    return this.shoppingListService.inventoryImage;
  }
  get shoppingList() {
    return this.shoppingListService.shoppingList;
  }
  get editInventoryLock() {
    return this.shoppingListService.editInventoryLock;
  }
  get lockInventoryEdit() {
    return this.shoppingListService.lockInventoryEdit;
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


  checkInventoryItem(inventory_id: number) {
    this.shoppingListService.checkInventoryItem(inventory_id);
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
