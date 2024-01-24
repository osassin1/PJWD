import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListStore } from '../models/shopping_list_store.model';
import { ListCategory } from '../models/list_category.model';
import { ShoppingListItems } from '../models/shopping_list_items.model';

const baseUrl = 'http://localhost:8080/api/shopping_list';

@Injectable({
    providedIn: 'root',
})



export class ShoppingListService {
    //private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    //public familyMember: Observable<FamilyMember | null>;

    //shoppingListAll : Map<string, ShoppingListItems[]> = new Map<"",[]>();

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

    getListByCategory(shopping_date: string, store_id : string, list_category_id : string): Observable<ShoppingListItems[]>{
    console.log('getListByCategory');
        return this.http.get<ShoppingListItems[]>
             (`${baseUrl}/list_by_category?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}`
             );
    }

    getListCatgory(): Observable<ListCategory[]>{
        return this.http.get<ListCategory[]>(`${baseUrl}/list_category`);
    }

    // login(username:string, password:string) {
    //     console.log("AuthenticationService: login");
    //     return this.http.post<FamilyMember>(`${baseUrl}/login`, {
    //         username, 
    //         password
    //     }).pipe(map(familyMember => {
    //         console.log("AuthenticationService: login in }).pipe(map(familyMember =>");
    //         console.log(familyMember);
    //         localStorage.setItem('familyMember', JSON.stringify(familyMember));
    //         this.familyMemberSubject.next(familyMember);
    //         return familyMember;            
    //     }));
    // };

}


