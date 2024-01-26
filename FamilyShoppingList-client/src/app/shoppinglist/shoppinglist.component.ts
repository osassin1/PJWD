import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { SafeUrl } from '@angular/platform-browser';

import { Observable } from 'rxjs';

import { NavigationComponent } from '../navigation/navigation.component';
import { ShoppingListItems } from '../models/shopping_list_items.model';
import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListTotal } from '../models/shopping_list_total.model';

import { ShoppingListService } from './shoppinglist.service';
import { InventoryService } from '../inventory/inventory.service';


@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, 
            NgSelectModule, NgStyle, NgOptionHighlightModule, NavigationComponent,
            NgbAccordionModule,
             ],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css'
})


export class ShoppinglistComponent implements OnInit {

  selectShoppingListForm!: FormGroup;
  //shoppingListDates! : Observable<ShoppingListDates[]>;
  
  selectedShoppingList: any = "";
  //myItem: any = "";

  shoppingToSelectFrom: any[] = [];  // get all dates and store as existing shopping list
  listCategories: any[] = [];  // get all categories

  //shoppingList: any[] = [];

  // The current shopping date, store and what's on
  // the list:
  shoppingDate : string = "";
  storeId : number = 0;
  storeName : string = "";

  //shoppingListItem : ShoppingListItems[] = [];
  //inventoryPicture_1 : any;

  
  //shoppingListAll : ShoppingListItems[][] = [];

  // this contains all inventory items on the shopping lisy by 
  // category, which is the key (string) for the Map<string, 
  // ShoppingListItems[]>. The array ShoppingListItems[] contains
  // the shopping item from inventory + quantity
  shoppingListAll : Map<string, ShoppingListItems[]> = new Map<"",[]>();

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

      this.shoppingListService.getListCatgory().subscribe((response:any) => {
        //console.log('getListCatgory - response:',response);
        this.listCategories = response;
      });

      this.shoppingListService.getAllDates().subscribe((response:any) => {
        //console.log('ShoppinglistComponent - response:',response);
        this.shoppingToSelectFrom = response;
        this.selectedShoppingList = this.shoppingToSelectFrom[0];
        //console.log('store.name: ' + this.selectedShoppingList['shopping_list_to_inventory.inventory_to_store.name']);
      });

  }

  get f() { return this.selectShoppingListForm.controls; }

  adjustForDecimals(x : any, unit : string) {
    if( unit == "2" ){  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }

  getCategoryNo(category_item : string){
    return this.shoppingListAllTotal.get(category_item) !== undefined;
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
        this.getShoppingListByCategory(this.shoppingDate, this.storeId.toString(), list_category_id);
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
  getShoppingListByCategory(shopping_date : string, store_id : string, list_category_id: string){

    this.shoppingListService.getListByCategory(shopping_date, store_id, list_category_id)
      .subscribe({
        next: (v) => {
          if (this.shoppingListAll.has(list_category_id)) {
            this.shoppingListAll.delete(list_category_id);
          }
          
          v.forEach((p => {
            this.inventoryService.loadPicture(p.inventory_id);
          }));

          this.shoppingListAll.set(list_category_id, v);
          let total_quantity: number = 0.;
          v.map((x => {
            total_quantity += +x.quantity;     
            // the '+x.quantity' is important
            // without the '+' sign it would 
            // concat strings instead of adding.
          }))

          // This creates the sum of inventory items (might not be useful) entered by different 
          // family members from the shopping list per category; it conatins the total 
          // quantity and who (via color reference) entered it.
          let tempArray: any[] = [];
          let tempMap = new Map();
          v.map((x => {
              tempMap.set(x.family_member_id, {  
              family_member_id: x.family_member_id,
              first_name: x.shopping_list_to_family_member.first_name,
              last_name: x.shopping_list_to_family_member.last_name,
              color_id: x.shopping_list_to_family_member.color_id,
              color_name: x.shopping_list_to_family_member.family_member_to_color.name
            })}
          ))

          // For each family member only one color circle should appear
          // need to exclude duplicates; family members can add multiple
          // items to each category
          tempMap.forEach(m => {
              tempArray.push(m);
          });

          if( tempArray.length ) {
            const shoppingListAllTotalTemp: ShoppingListTotal = <ShoppingListTotal>{
              list_category_id: parseInt(list_category_id),
              shopping_date: shopping_date,
              store_id: parseInt(store_id),
              total_quantity: total_quantity,
              family_members: tempArray  // only unique family member entires
            }
            this.shoppingListAllTotal.set(list_category_id, shoppingListAllTotalTemp);
          }

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
