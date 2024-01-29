import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListStore } from '../models/shopping_list_store.model';
import { ListCategory } from '../models/list_category.model';
import { ShoppingListItems } from '../models/shopping_list_items.model';

const baseUrl = 'http://localhost:8080/api/shopping_list';

@Injectable({
    providedIn: 'root',
})



export class ShoppingListService {

    private authenticated=false;

    constructor(
        private http: HttpClient
    ) {
    }


    getAllDates(): Observable<ShoppingListDates[]>{
        return this.http.get<ShoppingListDates[]>(`${baseUrl}/shopping_dates`);
    }

    getList(shopping_date: string, store_id : string): Observable<ShoppingListStore[]>{
        return this.http.get<ShoppingListStore[]>(`${baseUrl}/list?shopping_date=${shopping_date}&store_id=${store_id}`);
    }

    // getListByCategory(shopping_date: string, store_id : string, list_category_id : string): Observable<ShoppingListItems[]>{
    //     return this.http.get<ShoppingListItems[]>
    //          (`${baseUrl}/list_by_category?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}`
    //          );
    // }

    getListByCategoryByGroup(shopping_date: string, store_id : number, list_category_id : number): Observable<any>{
        return this.http.get<any>
             (`${baseUrl}/list_by_category_groupby?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}`
             );
    }
    getListCatgory(): Observable<ListCategory[]>{
        return this.http.get<ListCategory[]>(`${baseUrl}/list_category`);
    }
}


