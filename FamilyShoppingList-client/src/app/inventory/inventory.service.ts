import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


const baseUrl = 'http://localhost:8080/api/inventory';

@Injectable({
    providedIn: 'root',
})



export class InventoryService {
    //private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    //public familyMember: Observable<FamilyMember | null>;

    //shoppingListAll : Map<string, ShoppingListItems[]> = new Map<"",[]>();

    private authenticated=false;

    constructor(
        private http: HttpClient
    ) {
    }


    getPicture(inventory_id : number): Observable<any>{
        // const httpOptions: Object = {
        //     headers: new HttpHeaders({'Accept': 'image/png'}),
        //     responseType: 'blob' 
        //   };
        // return this.http.get<Observable<any>>(`${baseUrl}/picture?inventory_id=${inventory_id}`,  httpOptions);

        const httpOptions: Object = {
             //headers: new HttpHeaders({'Accept': 'image/png'}),
             responseType: 'text'
         };
        return this.http.get<any>(`${baseUrl}/picture?inventory_id=${inventory_id}`, httpOptions);
    }

}


