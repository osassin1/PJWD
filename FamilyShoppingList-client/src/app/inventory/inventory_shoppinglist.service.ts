import { Injectable } from '@angular/core';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})




export class ShoppingListInventoryService implements ShoppingListInventory {

    public num_of_items : number =0 ;                // "num_of_items": 1,
    public quantity : string = "";                   // "quantity": "3.50",
    public inventory_id: number = 0;                 // "inventory_id": 4,
    public picture: SafeUrl = "";
    public inventory_name: string = "";               // "inventory_name": "Butternut squash, organic",
    public inventory_notes: string = "";              // "inventory_notes": "Get the largest available.",
    public inventory_symbol: string = "";             // "inventory_symbol": "lbs",
    public inventory_unit: number = 0 
    public family_members : [
        {
            name : string,                // "name": "orange"
            quantity: string,             // "quantity": "7.00"
            first_name : string,
            last_name : string,
        }
    ] = [{name : "", quantity : "", first_name: "", last_name: ""}];
    
    // set shoppingListInventory( value : ShoppingListInventory ){
    //     this.family_member_id = value.family_member_id;
    //     this.username = value.username;
    //     this.first_name = value.first_name;
    //     this.last_name = value.last_name;
    //     this.token = value.token;
    //     this.color.color_id = value.color.color_id;
    //     this.color.family_member_id = value.color.family_member_id;
    //     this.color.name = value.color.name;
    // }


    // get webToken() { return this.token; }
    // get familyMemberID() { return this.family_member_id };
    // get userName() { return this.username; }
    // get firstName() { return this.first_name; }
    // get lastName() { return this.last_name; } 
    // get colorID() { return this.color.color_id; }
    // get colorName() { return this.color.name; } 

};
