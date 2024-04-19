import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


import { ShoppingListService } from '../shoppinglist/shoppinglist.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { InventoryService } from '../inventory/inventory.service';

import { ShoppingListDates } from '../models/shopping_list_dates.model'
import { Store } from '../models/store.model'

import { map } from 'rxjs';
import { Observable } from 'rxjs';


// This component creates a new shopping list, however,
// a new shopping list only comes into existing when 
// items are added to it. So, when 'creating' a new
// shopping list at least one item needs to be added for
// the list to exist by the items added to it.


@Component({
  selector: 'app-shoppinglist-new',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './shoppinglist-new.component.html',
  styleUrl: './shoppinglist-new.component.css'
})
export class ShoppinglistNewComponent implements OnInit {

  @Input() background: string = "";
  @Output() done = new EventEmitter<boolean>();

  storesToSelectFrom: any;

  shoppinglistNewForm!: FormGroup;
  dateToday = new Date();

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService: InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.shoppinglistNewForm = this.formBuilder.group({
      newShoppingListDate: ['', Validators.required],
      storesToSelectFrom: [null, Validators.required]
    }, {
      // This async validator makes a call to the services to check
      // for date and store combiation. If a shopping list (date + store)
      // already exists or existed then throw an error
      asyncValidators: exitsShoppingDateValidator(this.shoppingListService, this.authenticationService)
    });

    this.setTodaysDate();

    // get all shops that can be shopped from
    this.inventoryService.getListOfStores().subscribe((response: any) => {
      this.storesToSelectFrom = response;
    });
  }


  get slnf() {
    return this.shoppinglistNewForm.controls;
  }
  get sln() {
    return this.shoppinglistNewForm;
  }

  setTodaysDate() {
    const year = this.dateToday.getFullYear()

    let month: number | string = this.dateToday.getMonth() + 1
    let day: number | string = this.dateToday.getDate()

    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day

    var today = year + "-" + month + "-" + day;

    this.shoppinglistNewForm.controls['newShoppingListDate'].setValue(today);
  }

  onCancelAddNewShoppingList() {
    this.slnf['storesToSelectFrom'].setValue(null);
    this.slnf['newShoppingListDate'].setValue(null);
    this.setTodaysDate();

    this.done.emit(false);
  }

  onConfirmAddNewShoppingList() {
    const [year, month, day] = this.slnf['newShoppingListDate'].value.split("-")
    const newDateString = `${month}/${day}/${year}`;

    this.shoppingListService.shoppingList = <ShoppingListDates>{
      shopping_date: newDateString,
      store_id: this.slnf['storesToSelectFrom'].value['store_id'],
      family_id: this.authenticationService.familyMemberValue!.family_id,
      name: this.slnf['storesToSelectFrom'].value['name']
    };

    this.shoppingListService.store = <Store>{
      store_id: this.slnf['storesToSelectFrom'].value['store_id'],
      name: this.slnf['storesToSelectFrom'].value['name']
    };

    this.slnf['storesToSelectFrom'].setValue(null);
    this.slnf['newShoppingListDate'].setValue(null);

    this.setTodaysDate();

    this.done.emit(true);
  }
}


// Check if there was already a date and store combination for a shopping list.
// Also 'old' shopping lists will be excluded (shopping status >= 3).
export function exitsShoppingDateValidator(sls: ShoppingListService, auth: AuthenticationService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const [year, month, day] = control.get('newShoppingListDate')?.value.split("-");
    var newDateString = `${month}/${day}/${year}`;
    const storeID: number = control.get('storesToSelectFrom')?.value['store_id'];
    return sls.checkShoppingDate(auth.familyMemberValue!.family_id, newDateString, storeID)
      .pipe(map(x => x.length ? { shoppinglistExits: true } : null)
      );
  }
}


