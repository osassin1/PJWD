import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
//import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { SafeUrl } from '@angular/platform-browser';



import { NavigationComponent } from '../navigation/navigation.component';
// import { ShoppingListItems } from '../models/shopping_list_items.model';
// import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';

import { ShoppingListService } from './shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { LoggingService } from '../logging/logging.service';

//import { FamilyMemberService } from '../family_member/family_member.service';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,
    NgSelectModule, NgStyle, NgOptionHighlightModule, NavigationComponent,
  //  NgbModule,
  //  NgbAccordionModule,

  ],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css'
})


export class ShoppinglistComponent implements OnInit {

  selectShoppingListForm!: FormGroup;

 
  //selectedInventoryItem: any[] = [];
  selectedInventoryQuantity: number[] = [];

  
  selectedShoppingCategoryItem: any = "";

// for n-select when clicking the circle-plus  
selectInventoryByCategory: any[] = [];




  // The current shopping date, store and what's on
  // the list:
  shopping_date: string = "";
  store_id: number = 0;
  store_name: string = "";
  list_category_id: number = 0;


  // either uploaded or taken picture (mobil)
  selectedPicture: any[] = [];

  //newInventoryName: any[] = [];
  newInventoryQuantity: any[] = [];
  //newInventoryUnit: any[] = [];

  // determine if a store was selected
  hasStore: boolean = false;


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
  selectedInventoryPicture: any [] = [];
  selectedShoppingListQuantity: any[] = [];
  selectedInventoryUnit: any[] = [];

  // Bind the select box for items in a category
  // to an ngModel for two-way binding
  //selectedInventoryItemModel: string[] = [];

  // ok to take a picture to add to inventory
  takePicture: boolean[] = [];

  private trigger: Subject<void> = new Subject<void>();

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService: InventoryService,
    private authenticationService: AuthenticationService,
    private loggingService: LoggingService,
    private formBuilder: FormBuilder,
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
      select_shopping_category: null

      
    });

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
    this.shoppingListService.getAllDates().subscribe((response: any) => {
      this.shoppingToSelectFrom = response;
      this.selectedShoppingList = this.shoppingToSelectFrom[0];
    });

    // no store is selected yet
    this.hasStore = false;
  }

  // When a shopping list is selected from the <Select Shopping List>,
  // then extract the the shopping_date and store_id to identify the
  // list for that store + date.
  //
  // Bases on the available categories to shop from, initialize the various
  // data sections, which are usually based on its category. So, there's
  // and array from [first_category, ..., last_category] and for each item
  // store what is on the list and what is available (or known) for that store.
  onSelectChange() {
    this.shoppingListService.getAllDates().subscribe({
      next: (v) => {
        console.log('onSelectChange', v);
        console.log('this.selectShoppingListForm', this.selectShoppingListForm)

        
        this.hasStore = false;
        for (let item in this.listCategories) {
          const list_category_id = this.listCategories[item]['list_category_id'];
          this.shoppingListAll.delete(list_category_id);
          this.shoppingListAllTotal.delete(list_category_id);
        }

        if( this.selectShoppingListForm.value['shopping_list_form'] ){
          this.shopping_date = this.selectShoppingListForm.value['shopping_list_form']['shopping_date'];
          this.store_id = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.store_id'];
          this.store_name = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.name'];

          console.log('shopping_date', this.shopping_date);
          console.log('store_id', this.store_id);
          console.log('store_name', this.store_name);

          this.hasStore = true;

          for (let item in this.listCategories) {
            const list_category_id = this.listCategories[item]['list_category_id'];
            console.log('list_category_id',list_category_id);
            
            this.takePicture[list_category_id] = true; // can take pictures of that category

            // The method performs the following:
            // (1) fills shoppingListAll contains all inventory items for a category on the shopping list
            // (2) fills shoppingListAllTotal (it's the summary of what the category contains
            //     and is the accordion's button: <category name>  <family member dots> <total number of items>)
            this.getShoppingListByCategory(this.shopping_date, this.store_id, list_category_id);
            
            this.getInventoryListByCategory(this.store_id, list_category_id);

            this.selectedInventoryFlag[list_category_id] = true;
            this.selectedInventoryPicture[list_category_id] = "";
            this.selectedShoppingListQuantity[list_category_id] = "";
            this.selectedInventoryUnit[list_category_id] = "";
            //this.selectedInventoryItem[list_category_id] =  null;

            // this is neede for new items to make the 
            // increase and decrease buttons work
            this.newInventoryQuantity[list_category_id] = 0;

            // reset the formcontrol for selecting existing invenorty items
            // to be added to the shopping list
            this.selectShoppingListForm.controls['select_shopping_category'].patchValue(null);

          }
        }
      }, error: (e) => {
        console.error("Error in selecting shopping list", e);
      }
    });
  }

  // Load the shopping list by categories to match the accordion selector
  // and handle each section individually.
  getShoppingListByCategory(shopping_date: string, store_id: number, list_category_id: number) {

    console.log('getShoppingListByCategory', shopping_date, store_id, list_category_id);
    console.log('(1) this.shoppingListAll.get(list_category_id)', this.shoppingListAll.get(list_category_id));
    console.log('(1) this.shoppingListAllTotal.get(list_category_id)', this.shoppingListAllTotal.get(list_category_id));


    
    this.shoppingListAll.delete(list_category_id);
    this.shoppingListAllTotal.delete(list_category_id);

    this.shoppingListService.getListByCategoryByGroup(shopping_date, store_id, list_category_id)
      .subscribe({
        next: (v) => {
          this.shoppingListAll.set(list_category_id, v['inventory']);
          this.shoppingListAllTotal.set(list_category_id, v['category']);
          // load pictures, they will be cached in the
          // inventory service
          this.shoppingListAll.get(list_category_id)?.forEach((p => {
            this.inventoryService.loadPicture(p.inventory_id);
            this.inventoryService.loadInventory(store_id, p.inventory_id);
          }));
        }, error: (e) => {
          console.error(e.error.message);
        },
        complete: () => {
          console.info('getShoppingListByCategory: complete')
          console.log('(2) this.shoppingListAll.get(list_category_id)', this.shoppingListAll.get(list_category_id));
          console.log('(2) this.shoppingListAllTotal.get(list_category_id)', this.shoppingListAllTotal.get(list_category_id));
        }
      });

  
  }


  // initialize the inventory items by category one can select from
  // click the circle-plus to open the selection of item in that category
  getInventoryListByCategory(store_id: number, list_category_id: number) {
    this.inventoryService.getInventoryByCategory(store_id, list_category_id)
      .subscribe({
        next: (v) => {
          this.selectInventoryByCategory[list_category_id] = v;
          v.forEach((i:any)=>{
            var inventory_id = i['inventory_id'];
            this.inventoryService.loadPicture(inventory_id);
          })
        }
      })
  }

  // when an inventory item was selected then capture the following
  // what is the picture, quantity (for that family member) and unit
  onSelectInventoryItem(list_category_id: number) {
    //console.log('onSelectInventoryItem(list_category_id: number)', list_category_id)

   // console.log('this.selectShoppingListForm', this.selectShoppingListForm)

    //console.log('this.selectShoppingListForm', this.selectShoppingListForm.controls['select_shopping_category'] )

    if(this.selectShoppingListForm.controls['select_shopping_category'].value !== null){
      var inventory_id = this.selectShoppingListForm.controls['select_shopping_category'].value['inventory_id'];
      var quantity_symbol = this.selectShoppingListForm.controls['select_shopping_category'].value['quantity_symbol'];
      var quantity_unit = this.selectShoppingListForm.controls['select_shopping_category'].value['quantity_unit'];
      this.selectedInventoryFlag[list_category_id] = false;
      this.selectedInventoryPicture[list_category_id] = this.getPicture(inventory_id);
      this.selectedShoppingListQuantity[list_category_id] = this.getShoppingListQuantity(inventory_id, list_category_id);
      this.selectedInventoryUnit[list_category_id] = quantity_symbol;
    }

    this.selectShoppingListForm.controls['adjust_quantity'].setValue( this.getShoppingListQuantity(inventory_id, list_category_id) );
  }


  // Get the picture information as a string
  // from the inventory cache
  getPicture(inventory_id: number): SafeUrl {
    return this.inventoryService.pictureInventory.get(inventory_id) ?? "no_picture.jpg";
  }


  doIncreaseShoppingListQuantity(selectedShoppingListQuantity: any[], list_category_id: number){
    console.log('doIncreaseShoppingListQuantity', selectedShoppingListQuantity[list_category_id]);
    console.log('doIncreaseShoppingListQuantity', selectedShoppingListQuantity);

    if( selectedShoppingListQuantity[list_category_id]<=49){
      selectedShoppingListQuantity[list_category_id]++;
    }
  }

  doDecreaseShoppingListQuantity(selectedShoppingListQuantity: any[], list_category_id: number){
    if( selectedShoppingListQuantity[list_category_id]-1>=0){
      selectedShoppingListQuantity[list_category_id]--;
    }
  }

  doUpdateQuantity(event: any, selectedShoppingListQuantity: any[], list_category_id: number){
    //console.log('doUpdateQuantity', event);
    //console.log('selectedShoppingListQuantity[list_category_id]');
    var quantity = event.target.value;
    if( quantity>=0 && quantity<=50){
      selectedShoppingListQuantity[list_category_id]=quantity;
    }
  }

  doCancelQuantityChanges(list_category_id: number){
    console.log('doCancelQuantityChanges');
    //var inventory_id = this.selectedInventoryItem[list_category_id];
    var inventory_id = this.selectShoppingListForm.controls['select_shopping_category'].value['inventory_id'];

    this.selectedShoppingListQuantity[list_category_id] = this.getShoppingListQuantity(inventory_id, list_category_id);
    this.selectedInventoryFlag[list_category_id] = true;

    //this.selectedInventoryItem[list_category_id] = "";

    this.selectShoppingListForm.controls['select_shopping_category'].patchValue(null);

  }

  doMakeQuantityChanges(list_category_id: number){
    console.log('doMakeQuantityChanges');
    var inventory_id = this.selectShoppingListForm.controls['select_shopping_category'].value['inventory_id'];
    var quantity =  this.selectedShoppingListQuantity[list_category_id];
    var store_id =  this.selectShoppingListForm.controls['shopping_list_form'].value["shopping_list_to_inventory.inventory_to_store.store_id"];
    var shopping_date =  this.selectShoppingListForm.controls['shopping_list_form'].value["shopping_date"];
    var family_member_id = this.authenticationService.familyMemberValue?.family_member_id || 0;

    console.log('doMakeQuantityChanges::inventory_id', inventory_id);
    console.log('doMakeQuantityChanges::quantity', quantity);
    console.log('doMakeQuantityChanges::store_id', store_id);
    console.log('doMakeQuantityChanges::shopping_date', shopping_date);
    console.log('doMakeQuantityChanges::family_member_id', family_member_id);

    console.log('doMakeQuantityChanges', this.selectShoppingListForm.controls);

    this.shoppingListService.updateShoppingList(
      shopping_date, 
      family_member_id, 
      inventory_id, 
      quantity ).subscribe({
        next: (v) => {
          console.log('updateShoppingList', v);
        },
        error: (e) => {
          console.log('error', e);
        },
        complete: () => {
          console.log("complete");
          this.selectedInventoryFlag[list_category_id] = true;
          this.selectShoppingListForm.controls['select_shopping_category'].patchValue(null);
      
          this.getShoppingListByCategory(shopping_date, store_id, list_category_id);
          //this.inventoryService.updateInventory(store_id, list_category_id);
      
      
        }
      });


  }


  
  // When the clearAll (x) is being pressed within
  // the select: <Select inventory item>
  onClearQuantityChanges(list_category_id: number){
    this.selectedInventoryFlag[list_category_id] = true;
    console.log('onClearQuantityChanges', list_category_id);
    //console.log('onClearQuantityChanges --> selectInventoryItem',this.selectShoppingListForm.controls['select_shopping_category'])

  }


  doAddNewInventoryItem(list_category_id: number){
    var name: string = this.selectShoppingListForm.controls['new_inventory_item_name'].value;
    var quantity: number = this.newInventoryQuantity[list_category_id];
    var quantity_id: number  = this.selectShoppingListForm.controls['new_inventory_item_unit'].value; 
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
          },
          error: (e) => {
            console.log('error', e);
          },
          complete: () => {
            this.takePicture[list_category_id] = true;
            this.getShoppingListByCategory(shopping_date, store_id, list_category_id);
          }
        })
      }




  adjustForDecimals(x: any, unit: number) {
    if (unit == 2) {  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }

  
  logout() {
    console.log('shoppinglist.component : logout');
  }



  // onAddInventory(list_category_id: number) {
  //   console.log('onAddInvetory :', list_category_id);
  //   console.log('categoryId :', this.list_category_id);
  //   if (this.list_category_id != list_category_id) {

  //     this.list_category_id = list_category_id;
  //   }

  //   // const inventory =  this.inventoryService.loadInventory(this.storeId, list_category_id);
  //   //    this.inventoryItemsToSelectFrom = inventory
  //   //    this.inventoryItemsToSelectFromBS.next(inventory);
  //   //    this.inventoryItemsToSelectFrom = inventory; 


  //   // console.log('this.inventoryItemsToSelectFrom : ', this.inventoryItemsToSelectFrom);
  // }



  getInventoryDefaultSelect(list_category_id: number) {
    var inventoryArray = this.inventoryService.categoryInventoryNew.get(list_category_id);

    if (inventoryArray == undefined || !inventoryArray) {
      return "Select inventory item";
    }
    console.log('inventoryArray[0]:', inventoryArray[0]);
    return inventoryArray[0];
  }


  // checkCategory(element: any, _category: string): boolean {
  //   return (element === _category);
  // }





  // that needs refactoring
  //
  // This returns true if the inevntory item in on shopping list
  // otherwise it is false (it could be used to determine if
  // an item needs to be updated or added if not on it yet)
  // getCategory(list_category_id: number, inventory_id: number) {
  //   var found = false;
  //   this.shoppingListAll.get(list_category_id)?.forEach(x => {
  //     if (!found) {
  //       found = (x.inventory_id == inventory_id);
  //     }
  //   });
  //   return found;
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

  onSelectItem(itemId: string) {
    console.log('onSelectItem: ' + itemId);
  }




  onCancelInventoryItem() {
    console.log('onCancelInventoryItem');
  }


  onCameraInventoryItem() {
    console.log('onCameraInventoryItem');
  }



  onOkInventoryItem(list_category_id: number) {
    console.log('onOkInventoryItem');
    //console.log('onOkInventoryItem - inventory_id:', this.selectedInventoryItem[list_category_id]);
    console.log('onOkInventoryItem - list_category_id:', list_category_id);
    console.log('onOkInventoryItem - new_quantity:', this.selectedInventoryQuantity[list_category_id]);
    //console.log('onOkInventoryItem - old_quantity():', this.getShoppingListQuantity(this.selectedInventoryItem[list_category_id], list_category_id));
    console.log('onOkInventoryItem - shoppingDate:' + this.shopping_date);
    console.log('onOkInventoryItem - storeId:' + this.store_id);
    console.log('onOkInventoryItem - store name:' + this.store_name);
    console.log('onOkInventoryItem - this.authenticationService.familyMemberValue?.family_member_id:', this.authenticationService.familyMemberValue?.family_member_id);
  }

  doNothing(){

  }



  // Either upload a picture from your computer or if mobile
  // take a picture that will be used

  triggerSnapshot(list_category_id: number): void {
    this.list_category_id = list_category_id;
    this.trigger.next();
  }

  handleImage(event: any, list_category_id: number): void {
    console.info('handleImage', event.target.files[0]);
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.selectedPicture[list_category_id] = reader.result as string;
    }

    event.target.files[0];
    this.takePicture[list_category_id] = false;

    console.log('this.shoppingDate', this.shopping_date);
    console.log('this.storeId', this.store_id);
    console.log('this.storeName', this.store_name);
    console.log('this.categoryId', this.list_category_id);
    console.log('list_category_id', list_category_id);

    
    this.selectShoppingListForm.controls['new_inventory_item_quantity'].setValue(0);
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

}
