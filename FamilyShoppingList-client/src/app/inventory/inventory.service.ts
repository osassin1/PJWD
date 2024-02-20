import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ShoppingListInventory } from '../models/shopping_list_inventory.model';

import { AppConfiguration } from "read-appsettings-json";
import { catchError, map } from 'rxjs/operators';

import { LoggingService } from '../logging/logging.service';

//const baseUrl = 'http://localhost:8080/api/inventory';
//const baseUrl = 'http://192.168.1.193:8080/api/inventory';

//const baseUrl = 

const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/inventory";

@Injectable({
    providedIn: 'root',
})



export class InventoryService  {
   public pictureInventory : Map<number,SafeUrl> = new Map<0,"">();
   public inventoryData  : Map<number,any> = new Map<0,"">;

   public categoryInventoryNew : Map<number,any[]> = new Map<0,[]>;

    constructor(
        private http: HttpClient,
        private domSanatizer: DomSanitizer,
        private loggingService: LoggingService,
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

    getInventoryByStore(store_id : number): Observable<any>{
        return this.http.get<any>
             (`${baseUrl}/inventory_by_store?store_id=${store_id}`);
    }


    getInventoryByCategory(store_id : number, list_category_id : number): Observable<any>{
        return this.http.get<any>
             (`${baseUrl}/inventory_by_category?store_id=${store_id}&list_category_id=${list_category_id}`
             );
    }

    getAllUnits(): Observable<any>{
        return this.http.get<any>(`${baseUrl}/units`);
    }

    getInventoryByID(inventory_id: number){
        console.log('this.getInventoryByID',inventory_id);

        if(!this.inventoryData.has(inventory_id)){
            this.categoryInventoryNew.forEach(e => {
                e.forEach(i => {
                    var id = i['inventory_id'];
                    if(!this.inventoryData.has(id)){
                        this.inventoryData.set(id, i);
                    }
                })
        })}
        return this.inventoryData.get(inventory_id);
    }


    loadInventory(store_id : number, list_category_id: number) {
        if(!this.categoryInventoryNew.has(list_category_id)){
            this.getInventoryByCategory(store_id, list_category_id)
            .subscribe(inventory => {
                this.categoryInventoryNew.set(list_category_id, inventory);

                this.categoryInventoryNew.get(list_category_id)?.forEach(x => {
                    this.loadPicture(x['inventory_id']);
                });
            })
        }
        return this.categoryInventoryNew.get(list_category_id)!;
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
        return this.pictureInventory.get(inventory_id) ?? "no_picture.jpg";    // the function needs to retunr SafeUrl
                                                                        // but Map.get() could be SafeUrl or undefined
        }

        capturePicture(temp_inventory_id: number, list_category_id: number){
            console.log('temp_inventory_id:', temp_inventory_id);
            console.log('list_category_id:', list_category_id);
        }


    // createInventoryItem(name: string, picture: string, store_id: number, list_category_id: number, quantity_id: number ){
    //     console.log('createInventoryItem');
    //     this.loggingService.logEntry('createInventoryItem', 'name', name);
    //     this.loggingService.logEntry('createInventoryItem', 'url', `${baseUrl}/create_inventory_item`);

    //     console.log('`${baseUrl}/create_inventory_item`', `${baseUrl}/create_inventory_item`);

    //     return this.http.post<any>(`${baseUrl}/create_inventory_item`, {
    //         name, 
    //         picture,
    //         store_id,
    //         list_category_id,
    //         quantity_id
    //     }).pipe(
    //         catchError(err => {
    //             console.log( err );
    //         })
            
    //     );
    // }       

    createInventoryItem(name: string, picture: string, store_id: number, list_category_id: number, quantity_id: number ) : Observable<any> {
        // console.log('createInventoryItem');
        // this.loggingService.logEntry('createInventoryItem', 'name', name);
        // this.loggingService.logEntry('createInventoryItem', 'url', `${baseUrl}/create_inventory_item`);

        // console.log('`${baseUrl}/create_inventory_item`', `${baseUrl}/create_inventory_item`);

        return this.http.post(`${baseUrl}/create_inventory_item`, {
            name, 
            picture,
            store_id,
            list_category_id,
            quantity_id
        });
    }       
    
    // name, 
    // picture, 
    // store_id, 
    // list_category_id,
    // quantity_id,
    // shopping_date, 
    // family_member_id



    createInventoryItemAddToShoppingList(
        name: string, 
        picture: string, 
        store_id: number, 
        list_category_id: number, 
        quantity_id: number,
        quantity: number,
        shopping_date: string,
        family_member_id: number ) : Observable<any> {
            
            return this.http.post(`${baseUrl}/create_inventory_item_add_to_shoppinglist`, {
                name, 
                picture,
                store_id,
                list_category_id,
                quantity_id,
                quantity,
                shopping_date,
                family_member_id
            });            
    }
    // create(data: any): Observable<any> {
    //     return this.http.post(baseUrl, data);
    //   }

}

    


