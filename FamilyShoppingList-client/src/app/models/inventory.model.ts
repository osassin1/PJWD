import { SafeUrl } from "@angular/platform-browser"

export interface Inventory {
    inventory_id: number,                 // "inventory_id": 4,
    picture: any,
    name: string,               // "inventory_name": "Butternut squash, organic",
    notes: string,              // "inventory_notes": "Get the largest available.",
    symbol: string,     // to comply with shopping_list_inventory
    unit: number,    // to comply with shopping_list_inventory
    family_members: any,
    inventory_to_quantity : {
        quantity_id: number,
        name: string,
        symbol: string,             // "inventory_symbol": "lbs",
        unit: number, 
    },
    inventory_to_list_category : {
        list_category_id: number,
        name: string,
        description: string,
    }
}
