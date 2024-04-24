import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { Inventory } from '../models/inventory.model';
import { AppConfiguration } from "read-appsettings-json";
import { ListCategory } from '../models/list_category.model';


// Refer to appsettings.json to see possible 'serverUrl' settings
const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/inventory";

@Injectable({
    providedIn: 'root',
})

export class InventoryService {

    // This Map contains the picture for a store by inventory_id
    // as key. The pictures are stored as SafeUrl's.
    public pictureInventory: Map<number, SafeUrl> = new Map<0, "">();

    // *** DELETION ***
    // The inventory data is also cached within a Map keyed
    // by inventory id.
    //public inventoryData: Map<number, any> = new Map<0, "">;

    // This used to display all inventory data for a store
    // and get's changed once a category is changed from all to
    // any specific one.
    storeInventory!: Inventory[];

    constructor(
        private http: HttpClient,
        private domSanatizer: DomSanitizer,
    ) {

    }

    // Check if an invetory item is still used (referenced) in any shopping
    // list as active (shopping_status < 3)
    checkInventoryForDeleteion(inventory_id: number) {
        return this.http.get<any>(`${baseUrl}/check_inventory_for_deletion?inventory_id=${inventory_id}`);
    }

    // This returns the list of stores defined in the system
    getListOfStores(): Observable<any> {
        return this.http.get<any>(`${baseUrl}/list_of_stores`);
    }

    // Load all available quantities from table quantity
    getQuantities(): Observable<any> {
        return this.http.get<any>(`${baseUrl}/quantities`);
    }

    // This returns all categories defined in the system
    getListCatgory(): Observable<ListCategory[]> {
        return this.http.get<ListCategory[]>(`${baseUrl}/list_category`);
    }

    // Picture of inventory items are already stored as a string
    // and just need to be retrieved as string, therefore, responseType
    // is text and NOT blob.
    getPicture(inventory_id: number): Observable<any> {

        // The following did not work:
        //
        // const httpOptions: Object = {
        //     headers: new HttpHeaders({'Accept': 'image/png'}),
        //     responseType: 'blob' 
        //   };

        const httpOptions: Object = {
            responseType: 'text'
        };
        return this.http.get<any>(`${baseUrl}/picture?inventory_id=${inventory_id}`, httpOptions);
    }

    // Get all inventory items for a store, so it can be
    // modified. This request also includes the 'pictures'
    // of the inventory items.
    getInventoryByStoreForEdit(store_id: number): Observable<any> {
        //  const httpOptions: Object = {
        //      headers: new HttpHeaders({'Accept': 'image/png'}),
        //      responseType: 'text' 
        //    };        
        const httpOptions: Object = {
            responseType: 'text'
        };
        return this.http.get<any>
            (`${baseUrl}/inventory_by_store_for_edit?store_id=${store_id}`, httpOptions);
    }

    // It's wrapper around the actual loading function
    // to get all inventory items by store to be loaded
    loadInventoryByStore(store_id: number) {
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

    // When using the category filter within the inventory page,
    // just return the list for that category. This seemed to be
    // easier than dealing with filtering on the client side.
    getInventoryByStoreForEditByCategory(store_id: number, list_category_id: number): Observable<any> {
        //  const httpOptions: Object = {
        //      headers: new HttpHeaders({'Accept': 'image/png'}),
        //      responseType: 'text' 
        //    };        
        const httpOptions: Object = {
            responseType: 'text'
        };
        return this.http.get<any>
            (`${baseUrl}/inventory_by_store_for_edit_by_category?store_id=${store_id}&list_category_id=${list_category_id}`, httpOptions);
    }

    getInventoryByCategory(store_id: number, list_category_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/inventory_by_category?store_id=${store_id}&list_category_id=${list_category_id}`
            );
    }

    // Load a picture from the service for an inventory item and
    // place it into the picture Map. 
    loadPicture(inventory_id: number): SafeUrl {
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

    // Before deleting an inventory item (actually it only changes the status)
    // from active (A) to deleted (D) in the database, no shopping list can
    // reference it anymore.
    deleteInventoryItem(inventory_id: number): Observable<any> {
        return this.http.post(`${baseUrl}/delete_inventory_item`, {
            inventory_id
        });
    }


    updateInventoryItem(inventory_id: number, name: string, notes: string, picture: string, 
                        store_id: number, list_category_id: number, quantity_id: number): Observable<any> {
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


    createInventoryItem(name: string, notes: string, picture: string, store_id: number, 
                        list_category_id: number, quantity_id: number): Observable<any> {
        return this.http.post(`${baseUrl}/create_inventory_item`, {
            name,
            notes,
            picture,
            store_id,
            list_category_id,
            quantity_id
        });
    }
}

//--- end of file ---