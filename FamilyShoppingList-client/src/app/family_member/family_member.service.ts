import { Injectable } from '@angular/core';
import { FamilyMember } from '../models/family_member.model';

@Injectable({
    providedIn: 'root',
})

export class FamilyMemberService implements FamilyMember {
    
    public family_member_id: number = 0;
    public username: string = '';
    public first_name: string = '';
    public last_name: string = '';
    public token: string = '';
    public color : {
            color_id : number,
            family_member_id: number,
            name: string 
    } = {color_id:0, family_member_id:0, name: ''};
    private is_authenticated : boolean = false;


    set familyMember( value : FamilyMember ){
        this.family_member_id = value.family_member_id;
        this.username = value.username;
        this.first_name = value.first_name;
        this.last_name = value.last_name;
        this.token = value.token;
        this.color.color_id = value.color.color_id;
        this.color.family_member_id = value.color.family_member_id;
        this.color.name = value.color.name;
    }


    get webToken() { return this.token; }
    get familyMemberID() { return this.family_member_id };
    get userName() { return this.username; }
    get firstName() { return this.first_name; }
    get lastName() { return this.last_name; } 
    get colorID() { return this.color.color_id; }
    get colorName() { return this.color.name; } 

    set isAuthenticated(value : boolean){
        this.is_authenticated = value;
    }

    get isAuthenticated(){
        return this.is_authenticated;
    }
};
