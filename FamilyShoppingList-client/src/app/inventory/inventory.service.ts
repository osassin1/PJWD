import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ShoppingListInventory } from '../models/shopping_list_inventory.model';



const baseUrl = 'http://localhost:8080/api/inventory';

@Injectable({
    providedIn: 'root',
})



export class InventoryService  {
   public pictureInventory : Map<number,SafeUrl> = new Map<0,"">();
   public categoryInventory : any[] = [];

    constructor(
        private http: HttpClient,
        private domSanatizer: DomSanitizer,
    ) {

    }


    getPicture(inventory_id : number): Observable<any>{
        // const httpOptions: Object = {
        //     headers: new HttpHeaders({'Accept': 'image/png'}),
        //     responseType: 'blob' 
        //   };

        // Picture of inventory items are already stored as a string
        // and just need to be retrieved as string, therefore, responseType
        // is text and NOT blob.
        const httpOptions: Object = {
             responseType: 'text'
         };
        return this.http.get<any>(`${baseUrl}/picture?inventory_id=${inventory_id}`, httpOptions);
    }


    getInventoryByCategory(store_id : number, list_category_id : number): Observable<any>{
        return this.http.get<any>
             (`${baseUrl}/inventory_by_category?store_id=${store_id}&list_category_id=${list_category_id}`
             );
    }


    // loadInventory(store_id : number, list_category_id: number){
    //     if(!this.categoryInventory.has(list_category_id)){
    //         this.getInventoryByCategory(store_id, list_category_id)
    //         .subscribe(inventory => {
    //             console.log('InventoryService::loadInventory --> inventory : ', inventory);
    //             this.categoryInventory.set(list_category_id, inventory);
    //         })
    //     }
    //     return this.categoryInventory.get(list_category_id) ?? [];
    // }
    loadInventory(store_id : number, list_category_id: number) {
        // if(!this.categoryInventory.has(list_category_id)){
        //     this.getInventoryByCategory(store_id, list_category_id)
        //     .subscribe(inventory => {
        //         console.log('InventoryService::loadInventory --> inventory : ', inventory);
        //         this.categoryInventory.set(list_category_id, inventory);
        //     })
        // }
        // return this.categoryInventory.get(list_category_id)!;
        this.getInventoryByCategory(store_id, list_category_id)
             .subscribe(inventory => {
                console.log('InventoryService::loadInventory --> inventory : ', inventory);
                return inventory;
            })
    }

    loadPicture(inventory_id: number) : SafeUrl {
        if (!this.pictureInventory.has(inventory_id)) {
            this.getPicture(inventory_id)
                .subscribe(picture => {
                    let objectURL = picture;   
                    // picture is a string containing the correct format of 
                    // an image to be display via <img [src]  (property binding)
                    const cleanedPicture = this.domSanatizer.bypassSecurityTrustUrl(objectURL);

                    this.pictureInventory.set(inventory_id, cleanedPicture);
                })
        }
        return this.pictureInventory.get(inventory_id) ?? "default";    // the function needs to retunr SafeUrl
                                                                        // but Map.get() could be SafeUrl or undefined
        }
    }



