import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';




import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


import { ShoppingListService } from '../shoppinglist/shoppinglist.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { InventoryService } from '../inventory/inventory.service';

import { InventoryPictureComponent } from '../inventory-picture/inventory-picture.component'
import { ShoppingListInventory } from '../models/shopping_list_inventory.model';
import { Inventory } from '../models/inventory.model'
import { ShoppingListDates } from '../models/shopping_list_dates.model'
import { Store } from '../models/store.model'

import { map } from 'rxjs';
import { Observable, of } from 'rxjs';


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
export class ShoppinglistNewComponent implements OnInit, OnDestroy {

  //@Input() storesToSelectFrom: any;
  //@Input() familyMemberID: number = 0;
  @Input() background: string = "";
  @Output() done = new EventEmitter<boolean>();
  //@Output() shoppingListNew = new EventEmitter<ShoppingListDates>();
  
  storesToSelectFrom: any;

  shoppinglistNewForm!: FormGroup;
  dateToday = new Date();

  constructor(private shoppingListService: ShoppingListService,
    private inventoryService:InventoryService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder ){
  }
  
ngOnDestroy(): void {
  console.log('ShoppinglistNewComponent::ngOnDestroy')
}


  ngOnInit(): void {
    this.shoppinglistNewForm = this.formBuilder.group({
      newShoppingListDate: [ '', Validators.required],
      storesToSelectFrom:  [null, Validators.required]
    }, {
        asyncValidators: exitsShoppingDateValidator(this.shoppingListService, this.authenticationService)
    });


    // familyCode: ['', {
    //   validators: [Validators.required],
    //   asyncValidators: [codeExistsValidator(this.authenticationService)], updateOn: 'blur'
    // }]    


    this.setTodaysDate();

    // get all shops that can be shoppedn from
    this.inventoryService.getListOfStores().subscribe((response: any) => {
      this.storesToSelectFrom = response;
      //console.log('this.inventoryService.getListOfStores', this.storesToSelectFrom)
    });

  }


  get slnf(){
    return this.shoppinglistNewForm.controls;
  }
  get sln(){
    return this.shoppinglistNewForm;
  }

  setTodaysDate(){
    const year = this.dateToday.getFullYear()

    let month: number | string = this.dateToday.getMonth() + 1
    let day: number | string = this.dateToday.getDate()

    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day

    var today = year + "-" + month + "-" + day;

    this.shoppinglistNewForm.controls['newShoppingListDate'].setValue(today);    
  }

  onCancelAddNewShoppingList(){
    console.log('onCancelAddNewShoppingList')
    this.done.emit(false);

  }

  onConfirmAddNewShoppingList(){
    console.log('onConfirmAddNewShoppingList')

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

    //console.log('ShoppinglistNewComponent -->', this.shoppingListService.shoppingList)

    // this.slnf['storesToSelectFrom'].disable();
    // this.slnf['newShoppingListDate'].disable();

    this.slnf['storesToSelectFrom'].setValue(null);
    this.slnf['newShoppingListDate'].setValue(null);

    // this.slnf['storesToSelectFrom'].reset();
    // this.slnf['newShoppingListDate'].reset();

    this.setTodaysDate();

    //this.shoppingListNew.emit(newShoppingList)
    
    this.done.emit(true);

  }


}

// export function checkShoppingDate(family_id: number, shopping_date: string, store_id: number){
//   this.checkShoppingDate(family_id: number, shopping_date: string, store_id: number):
// }


export function exitsShoppingDateValidator(sls: ShoppingListService, auth: AuthenticationService): AsyncValidatorFn {
  console.log('export function exitsShoppingDateValidator')
  return (control: AbstractControl): Observable<ValidationErrors | null>  => {

    const [year, month, day] = control.get('newShoppingListDate')?.value.split("-");
    var newDateString = `${month}/${day}/${year}`;
    const storeID: number = control.get('storesToSelectFrom')?.value['store_id'];

    sls.checkShoppingDate(auth.familyMemberValue!.family_id, newDateString, storeID).subscribe(res=>{
      console.log('export function exitsShoppingDateValidator res:', res)
      if( res.length>0 ) {
        console.log('export function exitsShoppingDateValidator control', control);
        return of({shopplistExits: true}).pipe(map(() => null));
      }
      else {
        return of({'shopplistExits': true});
      }
    })
    return of(null);
  };
  }
 

