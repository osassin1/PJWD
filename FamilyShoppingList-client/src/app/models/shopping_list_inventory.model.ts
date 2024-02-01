import { SafeUrl } from "@angular/platform-browser"

export interface ShoppingListInventory {
    num_of_items : number,                // "num_of_items": 1,
    quantity : string,                    // "quantity": "3.50",
    inventory_id: number,                 // "inventory_id": 4,
    picture: SafeUrl,
    inventory_name: string,               // "inventory_name": "Butternut squash, organic",
    inventory_notes: string,              // "inventory_notes": "Get the largest available.",
    inventory_symbol: string,             // "inventory_symbol": "lbs",
    inventory_unit: number, 
    family_members : [
        {
            name : string,                // "name": "orange"
            quantity: string,             // "quantity": "7.00"
            first_name : string,
            last_name : string,
            family_member_id: number
        }
    ]
}    
