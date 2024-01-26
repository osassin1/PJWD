export interface ShoppingListTotal {
    list_category_id: number,
    shopping_date: string,
    store_id: number,
    total_quantity : number,
    family_members : [{
        family_member_id: number,
        first_name: string,
        last_name: string,
        color_id: number,
        color_name: string
    }]
}