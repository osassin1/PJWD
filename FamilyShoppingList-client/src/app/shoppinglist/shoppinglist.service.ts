import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, switchMap, BehaviorSubject, Subject } from 'rxjs';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListStore } from '../models/shopping_list_store.model';
import { ListCategory } from '../models/list_category.model';
import { ShoppingListItems } from '../models/shopping_list_items.model';
import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';

import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';

import { map } from 'rxjs/operators';
import { AppConfiguration } from "read-appsettings-json";
import { Store } from '../models/store.model';

// const baseUrl = 'http://localhost:8080/api/shopping_list';
//const baseUrl = 'http://192.168.1.193:8080/api/shopping_list';

const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/shopping_list";


@Injectable({
    providedIn: 'root',
})



export class ShoppingListService {

    private authenticated = false;

    //private shoppingListDatesSubject: BehaviorSubject<ShoppingListDates | null>;
    //public shoppingListDates : Observable<ShoppingListDates | null>;

    private shoppingListSubject = new Subject<ShoppingListDates>();
    public shoppingListObservable : Observable<ShoppingListDates>;

    private shoppingListRemovedSubject = new BehaviorSubject<boolean>(false);
    public shoppingListRemovedObservable : Observable<boolean>;

    pollingTimeInMilliSeconds: number = 5000;
    private subChangeCategory: any;


    /*
    export interface ShoppingListDates {
        shopping_date : string,
        store_id : number,
        family_id : number,
        name: string
    }
    */
    // shoppinglist_new is setting this variable
    _shoppingList: any;

    // get all dates and store as existing shopping list
     _shoppingToSelectFrom: any[] = [];

    // Once a shopping list has ben selected from the
    // available list in shoppingToSelectFrom, keep track 
    // with selectedShoppingList
    _selectedShoppingList: any = ""; 
    
    // this contains all inventory items on the shopping lisy by 
    // category, which is the key (string) for the Map<string, 
    // ShoppingListItems[]>. The array ShoppingListItems[] contains
    // the shopping item from inventory + quantity
    _shoppingListAll: Map<number, ShoppingListInventory[]> = new Map<0, []>();

    // It's the summary/totals of each category, e.g.
    // who (family member) has items in this category, how many
    // items are there. There's also a total of units, which
    // might be to complicated when summing up item(s) and weights.
    _shoppingListAllTotal: Map<number, ShoppingListTotal> = new Map<0, any>();


    // all categories for shopping / inventory
    _listCategory!: ListCategory;

    //*** Display attributes for shopping list ***/
    // maybe they can move?

     // gray filter applied to inventory items in shopping list
    _inventoryImage: string[] = [];    

    // for n-select when clicking the circle-plus  
    _selectInventoryByCategory: any[] = [];

    //_hasStore: boolean = false;

    _store!: Store;

    
    _isShopping: boolean = false;
    _isCheckout: boolean = false;
    _isCheckoutConfirm: boolean = false;
    
    
    constructor(
        private inventoryService:InventoryService,
        private authenticationService:AuthenticationService,
        private http: HttpClient
    ) {
        console.log('ShoppingListService::constructor')
        //this.shoppingListDatesSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('shoppingListDates')!));
        //this.shoppingListDates = this.shoppingListDatesSubject.asObservable();  
        this.shoppingListObservable = this.shoppingListSubject.asObservable();

        // When a shopping list is removed (after checkout confirmed) then
        // this will be TRUE - initial value is FALSE
        this.shoppingListRemovedObservable = this.shoppingListRemovedSubject.asObservable();

        this.onInit();      
    }

onInit() {
    console.log('ShoppingListService:: ngOnInit');

    // this.subChangeCategory = interval(this.pollingTimeInMilliSeconds)
    // .subscribe(() => {
    //     console.log('subChangeCategory:_shoppingList',this._shoppingList )
    // })

    // If the shoppingList changes then load the shopping list from
    // the service/db
    this.shoppingListObservable.subscribe((x:ShoppingListDates)=>{
        console.log('shoppingListService --> subscribed to shoppingListDate x=', x)

        for (let item in this.listCategory) {
            const list_category_id = this.listCategory[item]['list_category_id'];

            // The method performs the following:
            // (1) fills shoppingListAll contains all inventory items for a category on the shopping list
            // (2) fills shoppingListAllTotal (it's the summary of what the category contains
            //     and is the accordion's button: <category name>  <family member dots> <total number of items>)
            this.getShoppingListByCategory(
                x.shopping_date, 
                x.store_id, 
                x.family_id,
                list_category_id);
              this.getInventoryByCategory(x.store_id, list_category_id);
  
            this.inventoryService.loadInventoryByStore(x.store_id);
            this.inventoryImage.splice(0, this.inventoryImage.length);
          
            //*** NEEDS TO BE REVIEWED *** */
            //this.loadShoppingListStatus();
            //this.iconPlusDash[list_category_id] = "bi-plus-circle";

          }
    })
    
}

    get shoppingList(){
        return this._shoppingList;
    }
    set shoppingList(s: any){
        //this.shoppingListDatesSubject.next(s);
        this.shoppingListSubject.next(s);

        this._shoppingList = s;
        
    }
    get shoppingToSelectFrom(){
        return this._shoppingToSelectFrom;
    }
    set shoppingToSelectFrom(s: any){
        this._shoppingToSelectFrom = s;
    }
    get selectedShoppingList(){
        return this._selectedShoppingList;
    }
    set selectedShoppingList(s: any){
        this._selectedShoppingList = s;
    }
    get shoppingListAll(){
        return this._shoppingListAll;
    }
    set shoppingListAll(s:any){
         this._shoppingListAll = s;
    }
    get shoppingListAllTotal(){
        return this._shoppingListAllTotal;
    }
    set shoppingListAllTotal(s:any){
        this._shoppingListAllTotal = s;
    }
    get inventoryImage(){
        return this._inventoryImage;
    }
    set inventoryImage(s:any){
        this._inventoryImage=s;
    }
    get selectInventoryByCategory(){
        return this._selectInventoryByCategory;
    }
    set selectInventoryByCategory(s: any){
        this._selectInventoryByCategory = s;
    }
    // get hasStore(){
    //     return this._hasStore;
    // }
    // set hasStore(s:any){
    //     this._hasStore=s;
    // }
    get store(){
        return this._store;
    }
    set store(s:any){
        this._store = s;
    }
    get listCategory(){
        return this._listCategory;
    }
    set listCategory(s:any){
        this._listCategory = s;
    }
    get familyMemberID(){
        return this.authenticationService.familyMemberValue!.family_member_id;
    }
    get isShopping(){
        return this._isShopping;
    }
    set isShopping(s:any){
        this._isShopping=s;
    }
    get isCheckout(){
        return this._isCheckout;
    }
    set isCheckout(s:any){
        this._isCheckout = s;
    }
    get isCheckoutConfirm(){
        return this._isCheckoutConfirm;
    }
    set isCheckoutConfirm(s:any){
        this._isCheckoutConfirm = s;
    }

  // Load the shopping list by categories to match the accordion selector
  // and handle each section individually.
  getShoppingListByCategory(shopping_date: string, store_id: number, family_id: number, list_category_id: number) {
    this.shoppingListAll.delete(list_category_id);
    this.shoppingListAllTotal.delete(list_category_id);

    console.log('getShoppingListByCategory:: shopping_date', shopping_date)
    console.log('getShoppingListByCategory:: store_id', store_id)
    console.log('getShoppingListByCategory:: list_category_id', list_category_id)
    console.log('getShoppingListByCategory:: family_id', family_id)


    this.getListByCategoryByGroup(shopping_date, store_id, list_category_id, family_id)
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
          this.shoppingListAll.get(list_category_id)?.forEach(((p:any) => {
            // this.inventoryService.loadPicture(p.inventory_id);
            // this.inventoryService.loadInventory(store_id, p.inventory_id);
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
        },
        complete: () => {
          console.log('complete')
        }
      })
  }

  getAllShoppingDates(family_id: number){
    this.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
        this.shoppingToSelectFrom = response;
      });
  }

    getAllDates(family_id: number): Observable<ShoppingListDates[]> {
        console.log('getAllDates', family_id, `${baseUrl}/shopping_dates?family_id=${family_id}`)
        return this.http.get<ShoppingListDates[]>(`${baseUrl}/shopping_dates?family_id=${family_id}`);
    }

    getListByCategoryByGroup(shopping_date: string, store_id: number, list_category_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/list_by_category_groupby?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}&family_id=${family_id}`
            );
    }

    getListByCategoryByGroupCached(shopping_date: string, store_id: number, list_category_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/list_by_category_groupby_cached?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}&family_id=${family_id}`
            );
    }



  

    // pollListByCategoryByGroup(shopping_date: string, store_id: number, list_category_id: number, family_id: number): Observable<any> {
    //     return interval(5000).pipe (
    //         switchMap(() =>
    //         this.http.get<any>
    //         (`${baseUrl}/list_by_category_groupby?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}&family_id=${family_id}`
    //         )));
    // }



    updateShoppingList(shopping_date: string, family_member_id: number, inventory_id: number, quantity: number ){
        return this.http.post<any>(`${baseUrl}/update_shopping_list`, {
            shopping_date, 
            family_member_id,
            inventory_id,
            quantity
        }).pipe(map(sl => {
            return sl;            
        }));
    }
    

    
    changeShoppingStatus(shopping_date: string, store_id: number, family_id: number, shopping_status: number){
        return this.http.post<any>(`${baseUrl}/change_shopping_status`, {
            shopping_date, 
            store_id,
            family_id,
            shopping_status
        }).pipe(map(sl => {
            return sl;            
        }));
    }    


    checkoutShoppingList(shopping_date: string, store_id: number, family_id: number){
        return this.http.post<any>(`${baseUrl}/checkout_shopping_list`, {
            shopping_date, 
            store_id,
            family_id
        }).pipe(map(sl => {
            return sl;            
        }));
    }    


/*
    stopShopping(shopping_date: string, store_id: number, family_id: number){
        return this.http.post<any>(`${baseUrl}/stop_shopping`, {
            shopping_date, 
            store_id,
            family_id
        }).pipe(map(sl => {
            return sl;            
        }));
    }    

    
    startShopping(shopping_date: string, store_id: number, family_id: number){
        return this.http.post<any>(`${baseUrl}/start_shopping`, {
            shopping_date, 
            store_id,
            family_id
        }).pipe(map(sl => {
            return sl;            
        }));
    }    
*/
    shoppedItem(shopping_date: string, store_id: number, family_id: number, inventory_id: number){
        return this.http.post<any>(`${baseUrl}/shopped_item`, {
            shopping_date, 
            store_id,
            family_id,
            inventory_id
        }).pipe(map(sl => {
            return sl;            
        }));
    }    

    unShoppedItem(shopping_date: string, store_id: number, family_id: number, inventory_id: number){
        return this.http.post<any>(`${baseUrl}/un_shopped_item`, {
            shopping_date, 
            store_id,
            family_id,
            inventory_id
        }).pipe(map(sl => {
            return sl;            
        }));
    }    

    getShoppingListStatus(shopping_date: string, store_id: number, family_id: number): Observable<any> {
        const shoppingListDates : ShoppingListDates = {
            shopping_date: shopping_date,
            store_id: store_id,
            family_id: family_id,
            name: ""
        }
        //this.shoppingListDatesSubject.next(shoppingListDates);
        return this.http.get<any>
            (`${baseUrl}/get_shopping_list_status?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`
            );
    }

    getShoppedItemStatus(shopping_date: string, store_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/get_shopped_item_status?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`
            );
    }

    // pollShoppedItemStatus(): Observable<any> {
    //     return interval(5000).pipe (
    //         switchMap(() =>
    //         this.http.get<any>
    //         (`${baseUrl}/get_shopped_item_status?shopping_date=${this.shoppingListSubject.  value?.shopping_date}&store_id=${this.shoppingListSubject.value?.store_id}&family_id=${this.shoppingListSubject.value?.family_id}`
    //         )));
    // }

}


