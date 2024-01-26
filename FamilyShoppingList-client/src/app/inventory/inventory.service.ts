import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


const baseUrl = 'http://localhost:8080/api/inventory';

@Injectable({
    providedIn: 'root',
})



export class InventoryService {
   public pictureInventory : Map<number,SafeUrl> = new Map<0,"">();

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

    loadPicture(inventory_id: number) : SafeUrl {
        if (!this.pictureInventory.has(inventory_id)) {
            console.log('loadPicture:', inventory_id);

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



