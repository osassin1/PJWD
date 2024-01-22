import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { Router, ActivatedRoute } from '@angular/router';



import { NavigationComponent } from '../navigation/navigation.component';
import { Observable } from 'rxjs';

import { ShoppingListDates } from '../models/shopping_list_dates.model';
import { ShoppingListService } from './shoppinglist.service';


//imports: [NavigationComponent, NgSelectModule, CommonModule, NgStyle, FormsModule],

@Component({
  selector: 'app-shoppinglist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgSelectModule, NgStyle, NgOptionHighlightModule, NavigationComponent],
  templateUrl: './shoppinglist.component.html',
  styleUrl: './shoppinglist.component.css'
})


export class ShoppinglistComponent implements OnInit {

  selectShoppingListForm!: FormGroup;
  shoppingListDates! : Observable<ShoppingListDates[]>;
  selectedShoppingList: any = "";

  shoppingToSelectFrom: any[] = [];

  constructor(private shoppingListService: ShoppingListService,
              private formBuilder: FormBuilder) {
    
  }

  ngOnInit(){
      this.selectShoppingListForm = this.formBuilder.group({
        shopping_list_form : null,
        shopping_list_form_selected : null
      });

      this.shoppingListService.getAllDates().subscribe((response:any) => {
        console.log('ShoppinglistComponent - response:',response);
        this.shoppingToSelectFrom = response;
        this.selectedShoppingList = this.shoppingToSelectFrom[0];
        //this.selectShoppingListForm.setValue('shopping_list_form_selected');
      });
  

      console.log(this.shoppingListDates);
  }

  get f() { return this.selectShoppingListForm.controls; }

  logout(){
    console.log('shoppinglist.component : logout');
  }

  onSelectChange(){
    console.log('onSelectChange(event){');
    console.log(this.selectShoppingListForm.value );

    this.shoppingListService.getAllDates().subscribe((response:any) => {
      console.log('ShoppinglistComponent - response:',response);
      this.shoppingToSelectFrom = response;
      this.selectedShoppingList = this.shoppingToSelectFrom[0];
      //this.selectShoppingListForm.setValue('shopping_list_form_selected');
    });

  }

  getShoppingLists(){

  }
}
