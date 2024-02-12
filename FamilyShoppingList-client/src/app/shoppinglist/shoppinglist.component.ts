import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { SafeUrl } from '@angular/platform-browser';


// import { Observable } from 'rxjs';

import { NavigationComponent } from '../navigation/navigation.component';
// import { ShoppingListItems } from '../models/shopping_list_items.model';
// import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';

import { ShoppingListService } from './shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';

//import { FamilyMemberService } from '../family_member/family_member.service';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,
    NgSelectModule, NgStyle, NgOptionHighlightModule, NavigationComponent,
    // NgbModule,
    NgbAccordionModule,

  ],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css'
})


export class ShoppinglistComponent implements OnInit {

  selectShoppingListForm!: FormGroup;

  // drop-down select in category section of accardion
  selectShoppingCategoryForm!: FormGroup;

  // select from inventory
  selectFromInventoryForm!: FormGroup;
  selectedInventoryItem: any[] = [];
  selectedInventoryQuantity: number[] = [];

  // inventoryItemsToSelectFrom: ShoppingListInventory[] = [];
  // inventoryItemsToSelectFrom: any[] = [];
  //localCategoryInventory : Map<number, ShoppingListInventory[]> = new Map<0,[]>();

  // inventoryItemsToSelectFromBS: BehaviorSubject<any[] | []>;
  // inventoryItemsToSelectFromOb: Observable<any[] | []>;

  selectedShoppingList: any = "";
  selectedShoppingCategoryItem: any = "";


  shoppingToSelectFrom: any[] = [];  // get all dates and store as existing shopping list
  listCategories: any[] = [];  // get all categories

  // The current shopping date, store and what's on
  // the list:
  shoppingDate: string = "";
  storeId: number = 0;
  storeName: string = "";
  categoryId: number = 0;

  // ok to take a picture to add to inventory
  takePicture: boolean = true;

  // either uploaded or taken picture (mobil)
  selectedPicture: any;

  newInventoryName: any[] = [];
  newInventoryQuantity: any[] = [];
  newInventoryUnit: any[] = [];

  // determine if a store was selected
  hasStore: boolean = false;

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


  //public webcamImage: WebcamImage = new WebcamImage("","", new ImageData(0,0,undefined) ); 
  public webcamImage: any;
  private trigger: Subject<void> = new Subject<void>();

  triggerSnapshot(list_category_id: number): void {
    this.categoryId = list_category_id;
    this.trigger.next();
  }

  //  handleImage(webcamImage: WebcamImage): void { 
  handleImage(event: any): void {
    console.info('handleImage', event.target.files[0]);
    //this.webcamImage = webcamImage; 
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.selectedPicture = reader.result as string;
    }


    event.target.files[0];
    this.takePicture = false;

    console.log('this.shoppingDate', this.shoppingDate);
    console.log('this.storeId', this.storeId);
    console.log('this.storeName', this.storeName);
    console.log('this.categoryId', this.categoryId);


  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }



  constructor(private shoppingListService: ShoppingListService,
    private inventoryService: InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder) {

    // this.inventoryItemsToSelectFromBS = new BehaviorSubject(this.inventoryItemsToSelectFrom);
    // this.inventoryItemsToSelectFromOb = this.inventoryItemsToSelectFromBS.asObservable();


  }

  ngOnInit() {
    this.selectShoppingListForm = this.formBuilder.group({
      shopping_list_form: null,
      shopping_list_form_selected: null
    });

    this.selectShoppingCategoryForm = this.formBuilder.group({
      shopping_category_item_form: null,
      shopping_category_item_form_selected: null
    })

    this.selectFromInventoryForm = this.formBuilder.group({
      inventory_item_form: null
    });

    this.shoppingListService.getListCatgory().subscribe((response: any) => {
      this.listCategories = response;
    });

    this.shoppingListService.getAllDates().subscribe((response: any) => {
      this.shoppingToSelectFrom = response;
      this.selectedShoppingList = this.shoppingToSelectFrom[0];
    });




  }

  get f() { return this.selectShoppingListForm.controls; }
  //  getSLI(id:string){  return this.shoppingListAll.get(id);  } 


  adjustForDecimals(x: any, unit: number) {
    if (unit == 2) {  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }

  hasCategoryItems(category_item: number): boolean {

    // if the category doesn't exist yet, then return false
    // and stop checking
    if (this.shoppingListAllTotal.get(category_item) == undefined) {
      return false;
    }
    // the object must exist and we can be sure to check for
    // an element (total_num_of_items)
    else if (this.shoppingListAllTotal.get(category_item)!.total_num_of_items > 0) {
      return true;
    }

    // if total_num_of_items is NOT > 0 then
    // the category has no items
    return false;
  }


  logout() {
    console.log('shoppinglist.component : logout');
  }

  onSelectChange() {
    this.shoppingListService.getAllDates().subscribe((response: any) => {
      this.shoppingDate = this.selectShoppingListForm.value['shopping_list_form']['shopping_date'];
      this.storeId = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.store_id'];
      this.storeName = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.name'];

      console.log('shoppingDate:' + this.shoppingDate);
      console.log('storeId:' + this.storeId);
      console.log('store name:' + this.storeName);

      this.hasStore = true;

      for (let item in this.listCategories) {
        const list_category_id = this.listCategories[item]['list_category_id'];
        this.getShoppingListByCategory(this.shoppingDate, this.storeId, list_category_id);
        //this.localCategoryInventory.set(list_category_id, this.inventoryService.categoryInventory.get(list_category_id)! );
      }
    });
  }


  onAddInventory(list_category_id: number) {
    console.log('onAddInvetory :', list_category_id);
    console.log('categoryId :', this.categoryId);
    if (this.categoryId != list_category_id) {

      this.categoryId = list_category_id;
    }

    // const inventory =  this.inventoryService.loadInventory(this.storeId, list_category_id);
    //    this.inventoryItemsToSelectFrom = inventory
    //    this.inventoryItemsToSelectFromBS.next(inventory);
    //    this.inventoryItemsToSelectFrom = inventory; 


    // console.log('this.inventoryItemsToSelectFrom : ', this.inventoryItemsToSelectFrom);
  }

  getPicture(inventory_id: number): SafeUrl {
    //return this.inventoryService.pictureInventory.get(inventory_id) ??  this.inventoryService.loadPicture(inventory_id);
    this.inventoryService.loadPicture(inventory_id);

    return this.inventoryService.pictureInventory.get(inventory_id) ?? "no picture";
  }


  getInventoryByCategory(list_category_id: number) {
    return this.inventoryService.categoryInventoryNew.get(list_category_id) || null;
  }

  getInventoryByID(inventory_id: number) {
    return this.inventoryService.inventoryData.get(inventory_id) || this.inventoryService.getInventoryByID(inventory_id) || null;
  }


  getInventoryDefaultSelect(list_category_id: number) {
    var inventoryArray = this.inventoryService.categoryInventoryNew.get(list_category_id);

    if (inventoryArray == undefined || !inventoryArray) {
      return "Select inventory item";
    }
    console.log('inventoryArray[0]:', inventoryArray[0]);
    return inventoryArray[0];
  }

  // *** doesn't work ***
  // getInventoryByCategory(list_category_id:number){
  //   //console.log('this.inventoryService.categoryInventory.get(list_category_id):', this.inventoryService.categoryInventory.get(list_category_id))
  //   //return this.inventoryService.loadInventory(this.storeId, list_category_id);
  //   console.log('this.inventoryItemsToSelectFromBS.getValue():',this.inventoryItemsToSelectFromBS.getValue());
  //   return this.inventoryItemsToSelectFromBS.getValue();
  // }

  checkCategory(element: any, _category: string): boolean {
    return (element === _category);
  }


  // Load the shopping list by categories to match the accordion selector
  // and handle each section individually.
  getShoppingListByCategory(shopping_date: string, store_id: number, list_category_id: number) {

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
        complete: () => console.info('getShoppingListByCategory: complete')
      });
  }

  // that needs refactoring
  //
  // This returns true if the inevntory item in on shopping list
  // otherwise it is false (it could be used to determine if
  // an item needs to be updated or added if not on it yet)
  getCategory(list_category_id: number, inventory_id: number) {
    var found = false;
    this.shoppingListAll.get(list_category_id)?.forEach(x => {
      if (!found) {
        found = (x.inventory_id == inventory_id);
      }
    });
    return found;
  }

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

  onSelectInventoryItem(categoryId: number) {
    console.log('selectedInventoryItem[categoryId]: ', this.selectedInventoryItem[categoryId]);

    this.selectedInventoryQuantity[categoryId] = this.getShoppingListQuantity(this.selectedInventoryItem[categoryId], categoryId);
  }



  onCancelInventoryItem() {
    console.log('onCancelInventoryItem');
  }


  onCameraInventoryItem() {
    console.log('onCameraInventoryItem');
  }



  onOkInventoryItem(list_category_id: number) {
    console.log('onOkInventoryItem');
    console.log('onOkInventoryItem - inventory_id:', this.selectedInventoryItem[list_category_id]);
    console.log('onOkInventoryItem - list_category_id:', list_category_id);
    console.log('onOkInventoryItem - new_quantity:', this.selectedInventoryQuantity[list_category_id]);
    console.log('onOkInventoryItem - old_quantity():', this.getShoppingListQuantity(this.selectedInventoryItem[list_category_id], list_category_id));
    console.log('onOkInventoryItem - shoppingDate:' + this.shoppingDate);
    console.log('onOkInventoryItem - storeId:' + this.storeId);
    console.log('onOkInventoryItem - store name:' + this.storeName);
    console.log('onOkInventoryItem - this.authenticationService.familyMemberValue?.family_member_id:', this.authenticationService.familyMemberValue?.family_member_id);
  }



}
