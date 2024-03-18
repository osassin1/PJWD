import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, switchMap, BehaviorSubject } from 'rxjs';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListStore } from '../models/shopping_list_store.model';
import { ListCategory } from '../models/list_category.model';
import { ShoppingListItems } from '../models/shopping_list_items.model';

import { map } from 'rxjs/operators';
import { AppConfiguration } from "read-appsettings-json";

// const baseUrl = 'http://localhost:8080/api/shopping_list';
//const baseUrl = 'http://192.168.1.193:8080/api/shopping_list';

const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/shopping_list";


@Injectable({
    providedIn: 'root',
})



export class ShoppingListService {

    private authenticated = false;

    private shoppingListDatesSubject: BehaviorSubject<ShoppingListDates | null>;
    public shoppingListDates : Observable<ShoppingListDates | null>;

    constructor(
        private http: HttpClient
    ) {
        this.shoppingListDatesSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('shoppingListDates')!));
        this.shoppingListDates = this.shoppingListDatesSubject.asObservable();        
    }

    getAllDates(family_id: number): Observable<ShoppingListDates[]> {
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


    getListCatgory(): Observable<ListCategory[]> {
        return this.http.get<ListCategory[]>(`${baseUrl}/list_category`);
    }

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
        this.shoppingListDatesSubject.next(shoppingListDates);
        return this.http.get<any>
            (`${baseUrl}/get_shopping_list_status?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`
            );
    }

    getShoppedItemStatus(shopping_date: string, store_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/get_shopped_item_status?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`
            );
    }

    pollShoppedItemStatus(): Observable<any> {
        return interval(5000).pipe (
            switchMap(() =>
            this.http.get<any>
            (`${baseUrl}/get_shopped_item_status?shopping_date=${this.shoppingListDatesSubject.value?.shopping_date}&store_id=${this.shoppingListDatesSubject.value?.store_id}&family_id=${this.shoppingListDatesSubject.value?.family_id}`
            )));
    }

}


