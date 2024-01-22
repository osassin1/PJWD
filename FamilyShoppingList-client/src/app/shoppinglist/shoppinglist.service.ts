import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListStore } from '../models/shopping_list_store.model';

const baseUrl = 'http://localhost:8080/api/shopping_list';

@Injectable({
    providedIn: 'root',
})



export class ShoppingListService {
    //private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    //public familyMember: Observable<FamilyMember | null>;

    private authenticated=false;

    constructor(
        private http: HttpClient
    ) {
    }


    getAllDates(): Observable<ShoppingListDates[]>{
        return this.http.get<ShoppingListDates[]>(`${baseUrl}/shopping_dates`);
    }

    getList(a: string, store_id : number): Observable<ShoppingListStore[]>{
        return this.http.get<ShoppingListStore[]>(`${baseUrl}/list`);
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


