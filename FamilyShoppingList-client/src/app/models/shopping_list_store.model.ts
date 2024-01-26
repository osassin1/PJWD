export interface ShoppingListStore {
    shopping_date : string,
    family_member_id: number,
    inventory_id : number,
    quantity : number,
    inventory : {
        name: string,
        store_id: number,
        list_category_id : number,
        store : {
            name: string
        }
    }
}