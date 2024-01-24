import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
//import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

import { NavigationComponent } from '../navigation/navigation.component';
import { Observable } from 'rxjs';

import { ShoppingListItems } from '../models/shopping_list_items.model';
import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListTotal } from '../models/shopping_list_total.model';

import { ShoppingListService } from './shoppinglist.service';


//imports: [NavigationComponent, NgSelectModule, CommonModule, NgStyle, FormsModule],

@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, 
            NgSelectModule, NgStyle, NgOptionHighlightModule, NavigationComponent,
            NgbAccordionModule ],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css'
})


export class ShoppinglistComponent implements OnInit {

  selectShoppingListForm!: FormGroup;
  shoppingListDates! : Observable<ShoppingListDates[]>;
  selectedShoppingList: any = "";
  myItem: any = "";

  shoppingToSelectFrom: any[] = [];
  listCategories: any[] = [];
  shoppingList: any[] = [];

  // The current shopping date, store and what's on
  // the list:

  shoppingDate : string = "";
  storeId : number = 0;
  storeName : string = "";
  shoppingListItem : ShoppingListItems[] = [];

  // shopping list with all ietms
  //

  //shoppingListAll : ShoppingListItems[][] = [];
  shoppingListAll : Map<string, ShoppingListItems[]> = new Map<"",[]>();
  shoppingListAllTotal : Map<string, ShoppingListTotal> = new Map<"",any>();

  constructor(private shoppingListService: ShoppingListService,
              private formBuilder: FormBuilder) {
    
  }

  ngOnInit(){
      this.selectShoppingListForm = this.formBuilder.group({
        shopping_list_form : null,
        shopping_list_form_selected : null
      });

      this.shoppingListService.getListCatgory().subscribe((response:any) => {
        console.log('getListCatgory - response:',response);
        this.listCategories = response;
      });

      this.shoppingListService.getAllDates().subscribe((response:any) => {
        console.log('ShoppinglistComponent - response:',response);
        this.shoppingToSelectFrom = response;
        this.selectedShoppingList = this.shoppingToSelectFrom[0];
        console.log('store.name: ' + this.selectedShoppingList['shopping_list_to_inventory.inventory_to_store.name']);
      });
  

      console.log(this.shoppingListDates);
  }

  get f() { return this.selectShoppingListForm.controls; }

  logout(){
    console.log('shoppinglist.component : logout');
  }

  onSelectChange(){
    console.log('onSelectChange(event){');
    console.log('(1) ',  this.selectShoppingListForm.value['shopping_list_form'] );

    this.shoppingListService.getAllDates().subscribe((response:any) => {
      console.log('ShoppinglistComponent - response:',response);
      //this.shoppingToSelectFrom = response;
      //this.selectedShoppingList = this.shoppingToSelectFrom[0];
      //this.selectShoppingListForm.setValue('shopping_list_form_selected');

      console.log("this.selectedShoppingList['shopping_list_to_inventory.inventory_to_store.store_id']:",
      this.selectedShoppingList['shopping_list_to_inventory.inventory_to_store.store_id'])

      this.shoppingDate = this.selectShoppingListForm.value['shopping_list_form']['shopping_date'];
      this.storeId = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.store_id'];
      this.storeName = this.selectShoppingListForm.value['shopping_list_form']['shopping_list_to_inventory.inventory_to_store.name'];

      console.log('shoppingDate:' + this.shoppingDate);
      console.log('storeId:' + this.storeId);
      console.log('store name:' + this.storeName);
      //this.getShoppingList(this.selectedShoppingList['shopping_date'],this.selectedShoppingList['shopping_list_to_inventory.inventory_to_store.store_id']);

      //this.listCategories.forEach(this.insertInventoryIntoShoppingListAll);
      for (let item in this.listCategories){
        const list_category_id = this.listCategories[item]['list_category_id'];
        this.getShoppingListByCategory(this.shoppingDate, this.storeId.toString(), list_category_id);

        //this.shoppingListAll.get(list_category_id).values

        // this.shoppingListAll.set(list_category_id, this.getShoppingListByCategory(this.shoppingDate, this.storeId.toString(), list_category_id));
        //this.shoppingListAll.set(  this.insertInventoryIntoShoppingListAll(this.listCategories[item]);
      }

     console.log('this.shoppingListAll:');
     console.log(this.shoppingListAll);

    });

  }

  insertInventoryIntoShoppingListAll(value:any){
    console.log('insertInventoryIntoShoppingListAll');
    console.log(value);
    //getShoppingListByCategory(shopping_date : string, store_id : string, list_category_id: string)
    const list_category_id = value['list_category_id'];
    console.log('list_category_id:'+list_category_id);
    console.log(this.shoppingDate);
    console.log('this.storeId.toString():'+this.storeId.toString());
    this.getShoppingListByCategory(this.shoppingDate, this.storeId.toString(), list_category_id);
    return true;
  }



  checkCategory(element : any, _category : string) : boolean {
    return (element === _category );
  }

  getShoppingList(shopping_date : string, store_id : string){
    let list_category_id : string = "";

    this.shoppingListService.getList(shopping_date, store_id).subscribe((response:any) => {
      console.log('ShoppinglistComponent::getShoppingLists - response:',response);
      this.shoppingList = response;

     
      this.myItem = this.shoppingList[0];
      const key : string = 'shopping_list_to_invetory.name';
      console.log('key = ' + key);
      console.log('[key[] = ' + this.shoppingList[0]['shopping_list_to_invetory.inventory_to_list_category.name']);
      //const category = this.myItem['shopping_list_to_invetory.name'];
      list_category_id = this.myItem['shopping_list_to_inventory']['list_category_id'];
      console.log( list_category_id );
      //const category = this.shoppingList.find(p => p['shopping_list_to_invetory.name'])

      const myObject = new Object(response);

      console.log( myObject );

      let filterCategory = myObject.toString();
      //indexOf({'list_category_id':'7'});
      //.filter(this.checkCategory, "Fruit");

      console.log('Object :');
      console.log(myObject.toString());

     

    });
    //this.getShoppingListByCategory(shopping_date, store_id, list_category_id);
  }

//   .pipe(map ( item => {
//     console.log(item);
//     this.shoppingListAll.set(list_category_id, item);

//  }))


  getShoppingListByCategory(shopping_date : string, store_id : string, list_category_id: string){
    console.log('in getShoppingListByCategory');
    let total_quantity = 0;
    let shoppingListAllTotal : ShoppingListTotal;

    this.shoppingListService.getListByCategory(shopping_date, store_id, list_category_id)
      .subscribe({
        next: (v) => { 
          console.log('getShoppingListByCategory : ');
          console.log(v);
          if( this.shoppingListAll.has(list_category_id) ){
            this.shoppingListAll.delete(list_category_id);
          }
          this.shoppingListAll.set(list_category_id,v);
          v.map((x => { 
            total_quantity += x.quantity;
          }))
          console.log('total_quantity:', list_category_id, '  ', total_quantity);

          // --> doesn't work !!!!!!!!!!!!!!
          // shoppingListAllTotal.list_category_id = parseInt(list_category_id);
          // shoppingListAllTotal.shopping_date = shopping_date;
          // shoppingListAllTotal.store_id = parseInt(store_id);

        //   family_members : [{
        //     family_member_id: number,
        //     first_name: string,
        //     last_name: string,
        //     color_id: number,
        //     color_name: string
        // }]
          // v.map((x => { 
          //   console.log('new x:');
          //   console.log(x);
          //   shoppingListAllTotal.family_members.push({
          //     family_member_id: x.family_member_id,
          //     first_name: x.shopping_list_to_family_member.first_name,
          //     last_name: x.shopping_list_to_family_member.last_name,
          //     color_id: x.shopping_list_to_family_member.color_id,
          //     color_name: x.shopping_list_to_family_member.family_member_to_color.name
          //   });
          // }))

          

//          this.shoppingListAllTotal.set(list_category_id,shoppingListAllTotal);

          console.log(this.shoppingListAllTotal);
          
        },
        error: (e) => {
          console.error( e.error.message );
          //this.loading = false;
        },
        complete: () => console.info('getShoppingListByCategory: complete')
      });
  }


  // findCategory() {
  //   this.shoppingList.find()
  //    .pipe(map(data => {
  //      return data.toUpperCase();
  //    }))
  //    .subscribe(data => console.log(data))
  // }

  onSelectItem(itemId: string) {
    console.log('onSelectItem: ' + itemId );
  }

}
