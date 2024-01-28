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

  selectedShoppingList: any = "";
  selectedShoppingCategoryItem: any ="";

  
  shoppingToSelectFrom: any[] = [];  // get all dates and store as existing shopping list
  listCategories: any[] = [];  // get all categories

  // The current shopping date, store and what's on
  // the list:
  shoppingDate : string = "";
  storeId : number = 0;
  storeName : string = "";

  
  // this contains all inventory items on the shopping lisy by 
  // category, which is the key (string) for the Map<string, 
  // ShoppingListItems[]>. The array ShoppingListItems[] contains
  // the shopping item from inventory + quantity
  
  shoppingListAll : Map<string, ShoppingListInventory[]> = new Map<"",[]>();

  // It's the summary/totals of each category, e.g.
  // who (family member) has items in this category, how many
  // items are there. There's also a total of units, which
  // might be to complicated when summing up item(s) and weights.
  shoppingListAllTotal : Map<string, ShoppingListTotal> = new Map<"",any>();


  constructor(private shoppingListService: ShoppingListService,
              private inventoryService: InventoryService,
              private formBuilder: FormBuilder) {
    
  }

  ngOnInit(){
      this.selectShoppingListForm = this.formBuilder.group({
        shopping_list_form : null,
        shopping_list_form_selected : null
      });

      this.selectShoppingCategoryForm = this.formBuilder.group({
        shopping_category_item_form : null,
        shopping_category_item_form_selected: null
      })

      this.shoppingListService.getListCatgory().subscribe((response:any) => {
        this.listCategories = response;
      });

      this.shoppingListService.getAllDates().subscribe((response:any) => {
        this.shoppingToSelectFrom = response;
        this.selectedShoppingList = this.shoppingToSelectFrom[0];
      });

  }

  get f() { return this.selectShoppingListForm.controls; }
//  getSLI(id:string){  return this.shoppingListAll.get(id);  } 
  

  adjustForDecimals(x : any, unit : number) {
    if( unit == 2 ){  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }

  hasCategoryItems(category_item : string) : boolean {

    // if the category doesn't exist yet, then return false
    // and stop checking
    if( this.shoppingListAllTotal.get(category_item) == undefined) {
      return false;
    }
    // the object must exist and we can be sure to check for
    // an element (total_num_of_items)
    else if(this.shoppingListAllTotal.get(category_item)!.total_num_of_items  > 0 ) {
      return true;
    }

    // if total_num_of_items is NOT > 0 then
    // the category has no items
    return false;
  }
  

  logout(){
    console.log('shoppinglist.component : logout');
  }

  onSelectChange(){

    this.shoppingListService.getAllDates().subscribe((response:any) => {
      this.shoppingDate = this.selectShoppingListForm.value['shopping_list_form']['shopping_date'];
      this.storeId = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.store_id'];
      this.storeName = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.name'];

      console.log('shoppingDate:' + this.shoppingDate);
      console.log('storeId:' + this.storeId);
      console.log('store name:' + this.storeName);
      
      for (let item in this.listCategories){
        const list_category_id = this.listCategories[item]['list_category_id'];
        this.getShoppingListByCategoryNew(this.shoppingDate, this.storeId.toString(), list_category_id);
      }
    });

  }

  getPicture(inventory_id:number):SafeUrl{
    return this.inventoryService.pictureInventory.get(inventory_id) ?? "no loaded";
  }


  checkCategory(element : any, _category : string) : boolean {
    return (element === _category );
  }


  // Load the shopping list by categories to match the accordion selector
  // and handle each section individually.
  getShoppingListByCategoryNew(shopping_date : string, store_id : string, list_category_id: string){

    this.shoppingListService.getListByCategoryByGroup(shopping_date, store_id, list_category_id)
      .subscribe({
        next: (v) => {

          this.shoppingListAll.set(list_category_id, v['inventory']);
          this.shoppingListAllTotal.set(list_category_id, v['category']);

          // load pictures, they will be cached in the
          // inventory service
          this.shoppingListAll.get(list_category_id)?.forEach((p => {
            this.inventoryService.loadPicture(p.inventory_id);
           }));

        },error: (e) => {
          console.error(e.error.message);
        },
        complete: () => console.info('getShoppingListByCategory: complete')
      });
  }
  
  onSelectItem(itemId: string) {
    console.log('onSelectItem: ' + itemId );
  }

}
