import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model';

import { AppConfiguration } from "read-appsettings-json";
import { catchError, map } from 'rxjs/operators';

import{ ListCategory } from '../models/list_category.model';

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

   storeInventory!: Inventory[];

   public categoryInventoryNew : Map<number,any[]> = new Map<0,[]>;

    constructor(
        private http: HttpClient,
        private domSanatizer: DomSanitizer,
    ) {

    }

    checkInventoryForDeleteion(inventory_id: number){
        return this.http.get<any>(`${baseUrl}/check_inventory_for_deletion?inventory_id=${inventory_id}`);
    }

    getListOfStores(): Observable<any>{
        return this.http.get<any>(`${baseUrl}/list_of_stores`);
    }

    // load all available quantities from table quantity
    getQuantities(): Observable<any>{
        return this.http.get<any>(`${baseUrl}/quantities`);
    }

    // get all categories that are defined in list_category
    getListCatgory(): Observable<ListCategory[]> {
        return this.http.get<ListCategory[]>(`${baseUrl}/list_category`);
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

    getInventoryByStoreForEdit(store_id : number): Observable<any>{
        //  const httpOptions: Object = {
        //      headers: new HttpHeaders({'Accept': 'image/png'}),
        //      responseType: 'text' 
        //    };        
        const httpOptions: Object = {
            responseType: 'text'
        };
        return this.http.get<any>
             (`${baseUrl}/inventory_by_store_for_edit?store_id=${store_id}`,httpOptions);
    }

    loadInventoryByStore(store_id : number)  {
        console.log('loadInventoryByStore::store_id', store_id)
        this.storeInventory = [];
        this.getInventoryByStoreForEdit(store_id).subscribe({
            next: (v) => {
              let a = JSON.parse(v);
              this.storeInventory = a;
            }, error: (e) => {
              console.error(e.error.message);
            },
            complete: () => {
            }
          })        
    }





    getInventoryByStoreForEditByCategory(store_id : number, list_category_id: number): Observable<any>{
        //  const httpOptions: Object = {
        //      headers: new HttpHeaders({'Accept': 'image/png'}),
        //      responseType: 'text' 
        //    };        
        const httpOptions: Object = {
            responseType: 'text'
        };
        return this.http.get<any>
             (`${baseUrl}/inventory_by_store_for_edit_by_category?store_id=${store_id}&list_category_id=${list_category_id}`,httpOptions);
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




//     this.inventoryService.getInventoryByCategory(store_id, list_category_id)
//       .subscribe({
//         next: (v) => {
//           this.selectInventoryByCategory[list_category_id] = v;
//           v.forEach((i: any) => {
//             var inventory_id = i['inventory_id'];
//             this.inventoryService.loadPicture(inventory_id);

//           })
//         },
//         complete: () => {
//           console.log('complete')
//         }
//       })
//   }


    loadPicture(inventory_id: number) : SafeUrl {
        if (!this.pictureInventory.has(inventory_id)) {
            this.getPicture(inventory_id)
                .subscribe({
                    next: (picture) => {
                        let objectURL = picture;   
                        // picture is a string containing the correct format of 
                        // an image to be display via <img [src]  (property binding)
                        const cleanedPicture = this.domSanatizer.bypassSecurityTrustUrl(objectURL);

                        this.pictureInventory.set(inventory_id, cleanedPicture);
                    },
                    complete: () => {
                        // the function needs to retunr SafeUrl
                        // but Map.get() could be SafeUrl or undefined
                        return this.pictureInventory.get(inventory_id) ?? "no_picture.jpg";    
                    }
                })
        }
        return this.pictureInventory.get(inventory_id) ?? "no_picture.jpg"; 
    }

        capturePicture(temp_inventory_id: number, list_category_id: number){
            console.log('temp_inventory_id:', temp_inventory_id);
            console.log('list_category_id:', list_category_id);
        }


        deleteInventoryItem(inventory_id: number ) : Observable<any> {
            return this.http.post(`${baseUrl}/delete_inventory_item`, {
                inventory_id
            });
        }       
    

        updateInventoryItem(inventory_id: number, name: string, notes: string, picture: string, store_id: number, list_category_id: number, quantity_id: number ) : Observable<any> {
            return this.http.post(`${baseUrl}/update_inventory_item`, {
                inventory_id,
                name, 
                notes,
                picture,
                store_id,
                list_category_id,
                quantity_id
            });
        }       
            

    createInventoryItem(name: string, notes: string, picture: string, store_id: number, list_category_id: number, quantity_id: number ) : Observable<any> {
        return this.http.post(`${baseUrl}/create_inventory_item`, {
            name, 
            notes,
            picture,
            store_id,
            list_category_id,
            quantity_id
        });
    }       

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

    


