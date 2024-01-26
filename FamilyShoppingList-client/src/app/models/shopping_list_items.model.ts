import { SafeUrl } from "@angular/platform-browser"

export interface ShoppingListItems {
    shopping_date : string,               //  "shopping_date": "1/30/2024",
    family_member_id : number,            // "family_member_id": 1,
    quantity : number,
    inventory_id: number,
    shopping_list_to_family_member : {    // "shopping_list_to_family_member": {
        first_name : string,              // "first_name": "Oliver",
        last_name: string,
        color_id : number,                // "color_id": 6,
        family_member_to_color : {        // "family_member_to_color": {
            color_id : number,            // "color_id": 6,
            family_member_id : string,    // "family_member_id": 1,
            name : string,                // "name": "orange",
            }
    },
    shopping_list_to_inventory : {        // "shopping_list_to_inventory": {
            name : string,                // "name": "Apple sauce, organic",
            list_category_id : number,    // "list_category_id": 7,
            quantity_id : number,         // "quantity_id": 1,
            notes: string,
            inventory_to_store : {        // "inventory_to_store": {
                store_id: number          // "store_id": 1
            },
            inventory_to_list_category: { // "inventory_to_list_category": {
                name : string             // "name": "Cans & Pasta"
            },
            inventory_to_quantity: {      // "inventory_to_quantity": {
                quantity_id: number,      // "quantity_id": 1,
                name: string,             //  "name": "pounds",
                unit: string,             // "unit": 1,
                symbol: string,           // "symbol": "lbs",
            }
    }
}    
