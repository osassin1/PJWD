import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';

// import { GuiColumn, GuiGridModule } from '@generic-ui/ngx-grid';
// import { GuiColumnMenu, GuiPagingDisplay, GuiRowSelection, GuiRowSelectionMode, GuiRowSelectionType, GuiCellEdit, GuiSorting, GuiSortingOrder, GuiSummaries, GuiColumnSorting, GuiDataType, GuiCellView } from '@generic-ui/ngx-grid';

import { InventoryService } from '../inventory/inventory.service';
import { Inventory } from '../models/inventory.model'
import { Store } from '../models/store.model'
import { ListCategory } from '../models/list_category.model'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-inventory-edit',
  standalone: true,
  imports: [
    CommonModule, 
    // GuiGridModule,

  ],
  templateUrl: './inventory-edit.component.html',
  styleUrl: './inventory-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None  

})
export class InventoryEditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() store!: Store;

  source: Array<Inventory> = [];



  // columnSorting = {
  //   enabled: true,
  //   matcher: (inventory: Inventory) => inventory.name,
  //   order: GuiSortingOrder.ASC
  // };

  // columnMatcher = (item: any) => item.name;

  // sorting: GuiSorting = {
	// 	enabled: true,
	// 	multiSorting: true
	// };

  loading: boolean = false;


/*
	columns: Array<GuiColumn> = [
    {
			field: 'inventory_to_list_category',
			header: 'Category',
			type: GuiDataType.STRING,
			view: (category: any) => {
				return `<span style="white-space: pre-wrap;">${category.name}</span>`;
        //return `category: <${item.name}>`
			},
			sorting: {
				enabled: true
			},
      width: 80,
			cellEditing: {
				enabled: false
			},
			matcher: (item) => item.name
		},{
			field: (item) => item,
			header: 'Picture',
			type: GuiDataType.STRING,
			view: (cellValue: any) => {
				let template = `
					<span>
						<img src="${cellValue.picture}"  width="60" height="60"  />
					</span>
					
				`;
				return template;
			},
			width: 80,
			sorting: {
				enabled: true
			},
			cellEditing: {
				enabled: false
			},
			matcher: (item) => item.name
		}, {
			field: 'name',
			header: 'Name',
			type: GuiDataType.STRING,
			view: GuiCellView.TEXT,
      width: 120,
			cellEditing: {
				enabled: true
			}
		}, {
			field: 'notes',
			header: 'Notes',
			type: GuiDataType.STRING,
			view: GuiCellView.TEXT,
      width: 280,
			cellEditing: {
				enabled: true
			}
		},  {
			field: 'inventory_to_quantity',
			header: 'Unit',
			type: GuiDataType.STRING,
			view: (cellValue: any) => {
				// return `<div class="gui-team" style="background: ${cellValue.color}">
				// 			${cellValue.short}
				// </div>`;
        return `<div style="white-space: pre-wrap;">${cellValue.name}  ${cellValue.symbol} </div>`

        // return `<ng-template let-value="value" let-index="index" let-item="item">
        //         <select
        //           formControlName="new_inventory_item_unit"
        //           class="form-select input-frame-color"
        //           aria-label="unit selector"
        //           >
        //           <option selected>Select ${cellValue.quantity_id}
        //           </option>
        //           <option value="1">lbs</option>
        //           <option value="2">kg</option>
        //           <option value="3">item(s)
        //           </option>
        //           <option value="4">gal</option>
        //           <option value="5">L</option>
        //         </select>
        //         </ng-template>`;


			},
			width: 80,
			cellEditing: {
				enabled: false
			}}
		// }, {
		// 	field: 'training',
		// 	header: 'Training',
		// 	type: GuiDataType.NUMBER,
		// 	width: 140,
		// 	view: GuiCellView.BAR,
		// 	},
		// 	cellEditing: {
		// 		enabled: true
		// 	}
		 ]

	sorting = {
		enabled: true,
		multiSorting: true
	};

	GuiColumnMenu = {
		enabled: true,
		columnsManager: true
	};

	paging = {
		enabled: true,
		page: 1,
		pageSize: 10,
		pageSizes: [5, 10, 25, 50],
		display: GuiPagingDisplay.ADVANCED
	};
*/







  constructor(private inventoryService: InventoryService,
    private domSanatizer: DomSanitizer,
    private cd: ChangeDetectorRef){

  }

  ngOnInit() {

    return;

    // public pictureInventory : Map<number,SafeUrl> = new Map<0,"">();
    // public inventoryData  : Map<number,any> = new Map<0,"">;
 
    // public categoryInventoryNew : Map<number,any[]> = new Map<0,[]>;
 
    //console.log('EDIT: this.inventoryService.pictureInventory', this.inventoryService.pictureInventory)
    //console.log('this.inventoryService.inventoryData', this.inventoryService.inventoryData)
    //console.log('EDIT: this.inventoryService.categoryInventoryNew', this.inventoryService.categoryInventoryNew)

    // // get all categories one can shop from
    // this.inventoryService.getListCatgory().subscribe((category: ListCategory[]) => {
    //   //this.listCategories = response;
    //   //console.log('EDIT: this.inventoryService.getListCatgory', category)
    //   category.forEach(category=>{
    //       let list_category_id = category.list_category_id;
    //         //this.storeInventory[list_category_id] = this.inventoryService.loadInventory(, list_category_id)
    //         //console.log('this.store_id', this.store)
    //         //console.log('list_category_id', list_category_id)
    //           this.inventoryService.getInventoryByCategory( this.store.store_id, list_category_id).subscribe((response: any) => {
    //               //console.log('EDIT: getInventoryByCategory', response)
    //               response.forEach((x:any)=>{
    //                 this.inventoryService.loadPicture(x['inventory_id']);
    //                 this.inventoryService.loadInventory(this.store.store_id, x['inventory_id']);
    //                 this.source.push({
    //                             inventory_id: x.inventory_id,
    //                             picture: this.inventoryService.pictureInventory.get(x.inventory_id)!,
    //                             inventory_name: x.inventory_name,  
    //                             inventory_notes: x.inventory_notes, 
    //                             inventory_symbol: x.inventory_symbol,
    //                             inventory_unit: x.inventory_unit,                 
    //                           }
    //                         )
    //                       })                    
    //                       //console.log('source', this.source)     
    //                       this.cd.detectChanges(); 
                
    //               })
    //               //this.storeInventory[list_category_id] =  response;
    //               //this.cd.detectChanges(); 
    //             })      
    //             //this.cd.detectChanges(); 
    //       })
      
//this.loading = true;
      //     this.inventoryService.loadInventory(this.store_id, list_category_id)?.forEach(inv=>{

      //     //this.inventoryService.categoryInventoryNew.get(list_category_id)?.forEach(inv=>{
      //       console.log('EDIT: inv', inv)
      //       this.source.push({
      //           inventory_id: inv.inventory_id,
      //           picture: this.inventoryService.pictureInventory.get(inv.inventory_id)!,
      //           inventory_name: inv.inventory_name,  
      //           inventory_notes: inv.inventory_notes, 
      //           inventory_symbol: inv.inventory_symbol,
      //           inventory_unit: inv.inventory_unit,                 
      //         }
      //       )
      //     })
      //     console.log('source', this.source)
      //     this.inventoryService.storeInventory[list_category_id]
      //     this.cd.detectChanges();
      // })

    // });
  }

  ngOnDestroy(){
    console.log('ngOnDestroy')
  }

  onSelectedRows($event: any){
    console.log('onSelectedRows', $event)
  }

  ngOnChanges(){
    console.log('ngOnChanges')
    console.log('ngOnChanges: store', this.store)

    this.source = [];
    this.loading = false;

    this.inventoryService.getInventoryByStoreForEdit(this.store.store_id).subscribe({
      next: (v) => {
        let a = JSON.parse(v);
        this.source = a;
      }, error: (e) => {
        console.error(e.error.message);
      },
      complete: () => {
        this.cd.detectChanges(); 
      }
    })

    // this.inventoryService.getListCatgory().subscribe((category: ListCategory[]) => {
    //   //this.listCategories = response;
    //   //console.log('EDIT: this.inventoryService.getListCatgory', category)
    //   category.forEach(category=>{
    //       let list_category_id = category.list_category_id;
    //         //this.storeInventory[list_category_id] = this.inventoryService.loadInventory(, list_category_id)
    //         //console.log('this.store_id', this.store)
    //         //console.log('list_category_id', list_category_id)
    //           this.inventoryService.getInventoryByCategory( this.store.store_id, list_category_id).subscribe((response: any) => {
    //               //console.log('EDIT: getInventoryByCategory', response)
    //               response.forEach((x:any)=>{
    //                 this.inventoryService.loadPicture(x['inventory_id']);
    //                 this.inventoryService.loadInventory(this.store.store_id, x['inventory_id']);
    //                 this.source.push({
    //                             inventory_id: x.inventory_id,
    //                             picture: this.inventoryService.pictureInventory.get(x.inventory_id)!,
    //                             inventory_name: x.inventory_name,  
    //                             inventory_notes: x.inventory_notes, 
    //                             inventory_symbol: x.inventory_symbol,
    //                             inventory_unit: x.inventory_unit,                 
    //                           }
    //                         )
    //                       })                    
    //                       //console.log('source', this.source)     
    //                       //this.cd.detectChanges(); 
                          
                
    //               })
    //               this.cd.markForCheck();

    //               //this.storeInventory[list_category_id] =  response;
    //               //this.cd.detectChanges(); 
    //             })      
    //             console.log('source', this.source) 

    //             this.cd.detectChanges(); 


    //       })


          


  }

//   export interface Inventory {
//     inventory_id: number,                 // "inventory_id": 4,
//     picture: SafeUrl,
//     inventory_name: string,               // "inventory_name": "Butternut squash, organic",
//     inventory_notes: string,              // "inventory_notes": "Get the largest available.",
//     inventory_symbol: string,             // "inventory_symbol": "lbs",
//     inventory_unit: number, 
// }


}
