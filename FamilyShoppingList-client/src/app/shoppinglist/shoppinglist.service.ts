import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, interval } from 'rxjs';
import { map } from 'rxjs/operators';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ListCategory } from '../models/list_category.model';
import { ShoppingListTotal } from '../models/shopping_list_total.model';
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Store } from '../models/store.model';

import { InventoryService } from '../inventory/inventory.service';
import { AuthenticationService } from '../authentication/authentication.service';

import { AppConfiguration } from "read-appsettings-json";

const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/shopping_list";

@Injectable({
    providedIn: 'root',
})

export class ShoppingListService implements OnDestroy {

    private shoppingListSubject = new Subject<ShoppingListDates>();
    public shoppingListObservable: Observable<ShoppingListDates>;

    private shoppingListDoneSubject = new BehaviorSubject<boolean>(false);
    public shoppingListDoneObservable: Observable<boolean>;

    // This pair of subject & observable are used to
    // catch the edit state of shopping list and to lock
    // the workflow if an item is being worked on
    private editInventoryLockSubject = new BehaviorSubject<boolean>(false);
    public editInventoryLockObservable: Observable<boolean>;
    _lockInventoryEdit: boolean = false;

    // Polling for updates; it's running when the app starts
    // it could be activated when shopping is in progress?
    pollingTimeInMilliSeconds: number = 5000;
    private subChangeCategory: any;

    // shoppinglist_new is setting this variable
    _shoppingList: any;

    // get all dates and store as existing shopping list
    _shoppingToSelectFrom: any[] = [];

    // Once a shopping list has ben selected from the
    // available list in shoppingToSelectFrom, keep track 
    // with selectedShoppingList
    _selectedShoppingList: any = "";

    // this contains all inventory items on the shopping lisy by 
    // category, which is the key (string) for the Map<string, 
    // ShoppingListItems[]>. The array ShoppingListItems[] contains
    // the shopping item from inventory + quantity
    _shoppingListAll: Map<number, ShoppingListInventory[]> = new Map<0, []>();

    // It's the summary/totals of each category, e.g.
    // who (family member) has items in this category, how many
    // items are there. There's also a total of units, which
    // might be to complicated when summing up item(s) and weights.
    _shoppingListAllTotal: Map<number, ShoppingListTotal> = new Map<0, any>();

    // all categories for shopping / inventory
    _listCategory!: ListCategory;

    // gray filter applied to inventory items in shopping list
    _inventoryImage: string[] = [];

    // This conatins the inventory one can select from when 
    // clicking the circle-plus icon. This the call the shoppinglist-add
    // component.  
    _selectInventoryByCategory: any[] = [];

    // Set the store that has been selected in the shopping list
    // page and use it when navigating to inventory.
    _store: Store = <Store>{ store_id:0, name:""};

    _isShopping: boolean = false;
    _isCheckout: boolean = false;
    _isCheckoutConfirm: boolean = false;

    constructor(
        private inventoryService: InventoryService,
        private authenticationService: AuthenticationService,
        private http: HttpClient
    ) {
        this.shoppingListObservable = this.shoppingListSubject.asObservable();

        // When a shopping list is removed (after checkout confirmed) then
        // this will be TRUE - initial value is FALSE
        this.shoppingListDoneObservable = this.shoppingListDoneSubject.asObservable();
        this.editInventoryLockObservable = this.editInventoryLockSubject.asObservable();

        this.onInit();
    }

    onInit() {
        this.inventoryService.getListCatgory().subscribe(res => {
            this.listCategory = res;
        })

        this.subChangeCategory = interval(this.pollingTimeInMilliSeconds)
            .subscribe(() => {
                if (this.shoppingList != undefined) {
                    this.monitorChanges();
                }
            })

        // If the shoppingList changes then load the shopping list from
        // the service/db
        this.shoppingListObservable.subscribe((x: ShoppingListDates) => {
            this.shoppingListDoneSubject.next(true);

            for (let item in this.listCategory) {
                const list_category_id = this.listCategory[item]['list_category_id'];

                // The method performs the following:
                // (1) fills shoppingListAll contains all inventory items for a category on the shopping list
                // (2) fills shoppingListAllTotal (it's the summary of what the category contains
                //     and is the accordion's button: <category name>  <family member dots> <total number of items>)
                this.getShoppingListByCategory(
                    x.shopping_date,
                    x.store_id,
                    x.family_id,
                    list_category_id);
                this.getInventoryByCategory(x.store_id, list_category_id);

                this.inventoryService.loadInventoryByStore(x.store_id);
                this.inventoryImage.splice(0, this.inventoryImage.length);
            }
        })
    }

    ngOnDestroy(): void {
        this.subChangeCategory.unsubscribe();
    }
    changeEditInventoryLock(s: boolean) {
        this.editInventoryLockSubject.next(s);
    }
    get editInventoryLock() {
        return this.editInventoryLockSubject.getValue();
    }
    get lockInventoryEdit() {
        return this._lockInventoryEdit;
    }
    set lockInventoryEdit(s: any) {
        this._lockInventoryEdit = s;
    }
    get shoppingList() {
        return this._shoppingList;
    }
    set shoppingList(s: any) {
        this.shoppingListSubject.next(s);
        this._shoppingList = s;
    }
    get shoppingToSelectFrom() {
        return this._shoppingToSelectFrom;
    }
    set shoppingToSelectFrom(s: any) {
        this._shoppingToSelectFrom = s;
    }
    get selectedShoppingList() {
        return this._selectedShoppingList;
    }
    set selectedShoppingList(s: any) {
        this._selectedShoppingList = s;
    }
    get shoppingListAll() {
        return this._shoppingListAll;
    }
    set shoppingListAll(s: any) {
        this._shoppingListAll = s;
    }
    get shoppingListAllTotal() {
        return this._shoppingListAllTotal;
    }
    set shoppingListAllTotal(s: any) {
        this._shoppingListAllTotal = s;
    }
    get inventoryImage() {
        return this._inventoryImage;
    }
    set inventoryImage(s: any) {
        this._inventoryImage = s;
    }
    get selectInventoryByCategory() {
        return this._selectInventoryByCategory;
    }
    set selectInventoryByCategory(s: any) {
        this._selectInventoryByCategory = s;
    }
    get store() {
        return this._store;
    }
    set store(s: any) {
        this._store = s;
    }
    get listCategory() {
        return this._listCategory;
    }
    set listCategory(s: any) {
        this._listCategory = s;
    }
    get familyMemberID() {
        return this.authenticationService.familyMemberValue!.family_member_id;
    }
    get isShopping() {
        return this._isShopping;
    }
    set isShopping(s: any) {
        this._isShopping = s;
    }
    get isCheckout() {
        return this._isCheckout;
    }
    set isCheckout(s: any) {
        this._isCheckout = s;
    }
    get isCheckoutConfirm() {
        return this._isCheckoutConfirm;
    }
    set isCheckoutConfirm(s: any) {
        this._isCheckoutConfirm = s;
    }

    // Load the shopping list by categories to match the accordion selector
    // and handle each section individually.
    getShoppingListByCategory(shopping_date: string, store_id: number, family_id: number, list_category_id: number) {
        this.shoppingListAll.delete(list_category_id);
        this.shoppingListAllTotal.delete(list_category_id);

        this.getListByCategoryByGroup(shopping_date, store_id, list_category_id, family_id)
            .subscribe({
                next: (v) => {
                    this.shoppingListAll.set(list_category_id, v['inventory']);
                    this.shoppingListAllTotal.set(list_category_id, v['category']);
                }, error: (e) => {
                    console.error(e.error.message);
                },
                complete: () => {
                    // load pictures, they will be cached in the
                    // inventory service
                    this.shoppingListAll.get(list_category_id)?.forEach(((p: any) => {
                        // this.inventoryService.loadPicture(p.inventory_id);
                        // this.inventoryService.loadInventory(store_id, p.inventory_id);
                        if (p.shopping_status_id >= 2) {
                            this.inventoryImage[p.inventory_id] = "disabled";
                        }
                    }));
                }
            });
    }

    // initialize the inventory items by category one can select from
    // click the circle-plus to open the selection of item in that category
    getInventoryByCategory(store_id: number, list_category_id: number) {
        this.inventoryService.getInventoryByCategory(store_id, list_category_id)
            .subscribe({
                next: (v) => {
                    this.selectInventoryByCategory[list_category_id] = v;
                    this.selectInventoryByCategory[list_category_id].forEach((i: any) => {
                        var inventory_id = i['inventory_id'];
                        i.picture = this.inventoryService.loadPicture(inventory_id);
                    })
                }, error: (e) => {
                    console.error(e.error.message);
                }, complete: () => {
                }
            })
    }

    getAllShoppingDates(family_id: number) {
        this.getAllDates(this.authenticationService.familyMemberValue!.family_id).subscribe((response: any) => {
            this.shoppingToSelectFrom = response;
        });
    }

    existShoppingDate(family_id: number, shopping_date: string, store_id: number) {
        this.checkShoppingDate(family_id, shopping_date, store_id).subscribe((res) => {
            return res;
        })
    }

    // --- Shopping ---
    // The list is ready to be shopped, for that purpose, items can be checked-off
    // on the list, indicating that they are in the cart now. If the checkmark is
    // removed then the item is no longer in the cart. Items that are in the cart 
    // will be grayed out.

    // Update the status of items being in the process of being shopped and
    // set variables according to that status. With inventoryImage[inventory_id] = "disabled"
    // the item will be grayed out.
    checkInventoryItem(inventory_id: number) {
        if (this.inventoryImage[inventory_id] == "" ||
            this.inventoryImage[inventory_id] == undefined) {

            this.inventoryImage[inventory_id] = "disabled";
            this.shoppedItem(
                this.shoppingList.shopping_date,
                this.shoppingList.store_id,
                this.authenticationService.familyMemberValue!.family_id,
                inventory_id)
                .subscribe({
                    next: (v) => {
                    }, error: (e) => {
                        console.error(e);
                    }, complete: () => {
                    }
                })
        } else {
            this.inventoryImage[inventory_id] = "";
            this.unShoppedItem(
                this.shoppingList.shopping_date,
                this.shoppingList.store_id,
                this.authenticationService.familyMemberValue!.family_id,
                inventory_id)
                .subscribe({
                    next: (v) => {
                    }, error: (e) => {
                        console.error(e);
                    }, complete: () => {
                    }
                })
        }
    }

    monitorChanges() {
        if( !this.authenticationService.familyMemberValue ){
            return;
        }
        // For the current shopping list, ask for changes that are cached
        // on the server. This can be optimized by only returning data that
        // actually changed.
        for (let item in this.listCategory) {
            const list_category_id = this.listCategory[item]['list_category_id'];
            this.getListByCategoryByGroup(
                this.shoppingList.shopping_date,
                this.shoppingList.store_id,
                list_category_id,
                this.authenticationService.familyMemberValue!.family_id
            ).subscribe((res) => {
                if (res != null && this.shoppingListAll.get(list_category_id) != undefined) {
                    // The totals can just be replaced
                    this.shoppingListAllTotal.delete(list_category_id);
                    this.shoppingListAllTotal.set(list_category_id, res['category']);

                    // The inventory changes can be handled
                    const inventory = res['inventory'];
                    this.updateListInventory(this.shoppingListAll.get(list_category_id)!, res['inventory'], list_category_id);
                    this.getInventoryByCategory(this.shoppingList.store_id, list_category_id);
                }
            })
        }

        this.getShoppedItemStatus(
            this.shoppingList.shopping_date,
            this.shoppingList.store_id,
            this.shoppingList.family_id)
            .subscribe(v => {
                if (v && v['inventory_id']) {
                    let inventoryList: number[] = v['inventory_id'];
                    this.inventoryImage = [];
                    inventoryList.forEach((inventory_id: number) => {
                        this.inventoryImage[inventory_id] = "disabled";
                    })
                }
            })
    }

    updateListInventory(localInventory: ShoppingListInventory[], remoteInventory: ShoppingListInventory[], list_category_id: number) {
        let madeChanges: boolean = false;

        localInventory.forEach(li => {
            const item = remoteInventory.find((item) => item.inventory_id == li.inventory_id);

            // if another family member removed an item from the list (remote)
            // we also need to update our local list.
            if (item == undefined) {
                const itemNo = localInventory.findIndex((item) => item.inventory_id == li.inventory_id);
                localInventory.splice(itemNo, 1);
                madeChanges = true;
            }

            // if some changes happended to name or notes or quantity or number of items
            // we need to refresh the local list
            if (!madeChanges) {
                if (item?.name != li.name || item.notes != li.notes || item.quantity != li.quantity || item.num_of_items != li.num_of_items) {
                    let indexForUpdate = localInventory.findIndex((item) => item.inventory_id == li.inventory_id);
                    const picture = li.picture;  // remember the pciture
                    localInventory[indexForUpdate] = item!;
                    localInventory[indexForUpdate].picture = picture;
                    madeChanges = true;
                }
            }
        })

        // if the remote list has additional (new) items, then we need to update the local list
        remoteInventory.forEach(ri => {
            const item = localInventory.findIndex((item) => item.inventory_id == ri.inventory_id);
            if (item == -1) {
                ri.picture = this.inventoryService.loadPicture(ri.inventory_id);
                localInventory.push(ri);
                madeChanges = true;
            }
        })

        // if( madeChanges ){
        //     this.getShoppingListByCategory(
        //         this.shoppingList.shopping_date,
        //         this.shoppingList.store_id,
        //         this.shoppingList.family_id,
        //         list_category_id);
        // }

        return madeChanges;
    }

    checkShoppingDate(family_id: number, shopping_date: string, store_id: number): Observable<any> {
        return this.http.get<any>(`${baseUrl}/check_shopping_date?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`);
    }

    getAllDates(family_id: number): Observable<ShoppingListDates[]> {
        return this.http.get<ShoppingListDates[]>(`${baseUrl}/shopping_dates?family_id=${family_id}`);
    }

    getListByCategoryByGroup(shopping_date: string, store_id: number, list_category_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/list_by_category_groupby?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}&family_id=${family_id}`
            );
    }

    getListByCategoryByGroupCached(shopping_date: string, store_id: number, list_category_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/list_by_category_groupby_cached?shopping_date=${shopping_date}&store_id=${store_id}&list_category_id=${list_category_id}&family_id=${family_id}`
            );
    }

    updateShoppingList(shopping_date: string, family_member_id: number, inventory_id: number, quantity: number) {
        return this.http.post<any>(`${baseUrl}/update_shopping_list`, {
            shopping_date,
            family_member_id,
            inventory_id,
            quantity
        }).pipe(map(sl => {
            return sl;
        }));
    }

    changeShoppingStatus(shopping_date: string, store_id: number, family_id: number, shopping_status: number) {
        return this.http.post<any>(`${baseUrl}/change_shopping_status`, {
            shopping_date,
            store_id,
            family_id,
            shopping_status
        }).pipe(map(sl => {
            return sl;
        }));
    }

    checkoutShoppingList(shopping_date: string, store_id: number, family_id: number) {
        return this.http.post<any>(`${baseUrl}/checkout_shopping_list`, {
            shopping_date,
            store_id,
            family_id
        }).pipe(map(sl => {
            return sl;
        }));
    }

    shoppedItem(shopping_date: string, store_id: number, family_id: number, inventory_id: number) {
        return this.http.post<any>(`${baseUrl}/shopped_item`, {
            shopping_date,
            store_id,
            family_id,
            inventory_id
        }).pipe(map(sl => {
            return sl;
        }));
    }

    unShoppedItem(shopping_date: string, store_id: number, family_id: number, inventory_id: number) {
        return this.http.post<any>(`${baseUrl}/un_shopped_item`, {
            shopping_date,
            store_id,
            family_id,
            inventory_id
        }).pipe(map(sl => {
            return sl;
        }));
    }

    getShoppingListStatus(shopping_date: string, store_id: number, family_id: number): Observable<any> {
        const shoppingListDates: ShoppingListDates = {
            shopping_date: shopping_date,
            store_id: store_id,
            family_id: family_id,
            name: ""
        }
        return this.http.get<any>
            (`${baseUrl}/get_shopping_list_status?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`
            );
    }

    getShoppedItemStatus(shopping_date: string, store_id: number, family_id: number): Observable<any> {
        return this.http.get<any>
            (`${baseUrl}/get_shopped_item_status?shopping_date=${shopping_date}&store_id=${store_id}&family_id=${family_id}`
            );
    }
}

//---- end of file ---