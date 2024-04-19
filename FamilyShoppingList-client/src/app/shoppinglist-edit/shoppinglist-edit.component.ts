import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { ShoppingListService } from '../shoppinglist/shoppinglist.service';

import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'

@Component({
  selector: 'app-shoppinglist-edit',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule,
    InventoryPictureComponent,
  ],
  templateUrl: './shoppinglist-edit.component.html',
  styleUrl: './shoppinglist-edit.component.css'
})
export class ShoppinglistEditComponent implements OnInit {

  @Input() shoppingListItem!: ShoppingListInventory | Inventory;
  @Input() background: string = "";
  @Input() disabledString: string = "";
  @Output() done = new EventEmitter<any>();
  @Output() inventory_id = new EventEmitter<number>();

  shoppingListEditForm!: FormGroup;


  quantity: number = 0;

  constructor(
    private shoppingListService: ShoppingListService,
    private formBuilder: FormBuilder) {
  }


  ngOnInit() {
    // Select the quantity for a family member if they already have the item
    // otherwise it's new and gets the default value of 1 (based on feedback)
    if (this.shoppingListItem.family_members) {
      this.quantity = parseInt(this.shoppingListItem.family_members.find((v: any) => v.family_member_id == this.familyMemberID)?.quantity || "1");
    } else {
      this.quantity = 1;
    }

    this.shoppingListEditForm = this.formBuilder.group({
      quantity: this.quantity
    });

    this.shoppingListService.shoppingListDoneObservable.subscribe(x => {
      // If shopping list has been checkedout and is done
      if (x && this.shoppingList.store_id == 0) {
        this.onCancelEdit();
      }
    })

    this.shoppingListService.lockInventoryEdit = true;
    this.shoppingListService.changeEditInventoryLock(true);
  }

  get shoppingList() {
    return this.shoppingListService.shoppingList;
  }

  get familyMemberID() {
    return this.shoppingListService.familyMemberID;
  }

  onDoneEdit() {

    this.shoppingListService.updateShoppingList(
      this.shoppingList.shopping_date,
      this.familyMemberID,
      this.shoppingListItem.inventory_id,
      this.quantity).subscribe({
        next: (v) => {
          // console.log('shoppinglist-edit::onDoneEdit v:',v)
        },
        error: (e) => {
          console.error('error', e);
        },
        complete: () => {
          this.shoppingListService.lockInventoryEdit = false;
          this.shoppingListService.changeEditInventoryLock(false);
          this.inventory_id.emit(this.shoppingListItem.inventory_id);
          this.done.emit(true);
        }
      });
  }


  onCancelEdit() {
    this.shoppingListService.lockInventoryEdit = false;
    this.shoppingListService.changeEditInventoryLock(false);
    this.inventory_id.emit(this.shoppingListItem.inventory_id);
    this.done.emit(false);
  }


  doIncreaseShoppingListQuantity() {
    if (this.quantity <= 49) {
      this.quantity++;
    }
  }

  doDecreaseShoppingListQuantity() {
    if (this.quantity - 1 >= 0) {
      this.quantity--;
    }
  }

  doUpdateQuantity($event: any) {
    if ($event.target.value >= 0 && $event.target.value <= 50) {
      this.quantity = $event.target.value;
    }
  }


  adjustForDecimals(x: any, unit: number) {
    if (unit == 2) {  // number
      const v = Number.parseFloat(x).toFixed(0);
      return v;
    }
    return x;
  }
}
