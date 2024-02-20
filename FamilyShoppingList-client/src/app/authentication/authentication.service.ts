import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, CanActivateFn } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { FamilyMember } from '../models/family_member.model';
import { Color } from '../models/color.model';

import {  ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppConfiguration } from "read-appsettings-json";

//const baseUrl = 'http://192.168.1.193:8080/api/family_member';
//const baseUrl = 'http://localhost:8080/api/family_member'; 
//const baseUrl = 'http://127.0.0.1:3000/api/family_member';

const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/family_member";

@Injectable({
    providedIn: 'root',
})


/*

https://jasonwatmore.com/post/2022/12/22/angular-14-role-based-authorization-tutorial-with-example

*/


export class AuthenticationService  {
    private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    public familyMember: Observable<FamilyMember | null>;

    private authenticated=false;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        console.log('AuthenticationService::in constructor');
        this.familyMemberSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('familyMember')!));
        console.log('AuthenticationService::BehaviorSubject :', localStorage.getItem('familyMember')  );
        this.familyMember = this.familyMemberSubject.asObservable();
    }

    public getAuthenticated(){
        console.log('AuthenticationService::getAuthenticate=' + this.authenticated);
        return this.authenticated;
    }

    public setAuthenticated(value:boolean){
        console.log('AuthenticationService::setAuthenticated=' + value);
        this.authenticated = value;
    }

    public get familyMemberValue() {
        return this.familyMemberSubject.value;
    }


    getAll(): Observable<FamilyMember[]>{
        return this.http.get<FamilyMember[]>(baseUrl);
    }
    getAllColors(): Observable<Color[]>{
        return this.http.get<Color[]>(`${baseUrl}/colors`);
    }

    login(username:string, password:string) {
        console.log("AuthenticationService: login");
        console.log("AuthenticationService: login --> this.familyMemberSubject.value : ", this.familyMemberSubject.value);
        console.log("AuthenticationService: baseUrl", baseUrl);
        return this.http.post<FamilyMember>(`${baseUrl}/login`, {
            username, 
            password
        }).pipe(map(fm => {
            console.log('login : ', fm);
            localStorage.setItem('familyMember', JSON.stringify(fm));
            //this.familyMemberSubject.
            this.familyMemberSubject.next(fm);
            console.log("AuthenticationService: login.familyMember --> this.familyMemberSubject.value : ", this.familyMemberSubject.value);
            return fm;            
        }));
    };

    logout(){
        console.log("AuthenticationService: logout");
        console.log(localStorage.getItem('familyMember'));
        localStorage.removeItem('familyMember');
        //localStorage.clear();
        

        // This make re-login impossible
        // need to investigate more
        this.familyMemberSubject.next(null);
        //this.familyMemberSubject.closed;
        this.router.navigate(['/']);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean {
        console.log('AuthenticationService: canActivate');
        //const familyMember = this.familyMemberValue;
        console.log('AuthenticationService: canActivate --> this.familyMemberSubject.value : ',this.familyMemberSubject.value);
        console.log('AuthenticationService: canActivate --> this.familyMember : ',this.familyMember);

        if (this.familyMemberSubject.value) {
            console.log('AuthenticationService: canActivate --> familyMember :', this.familyMemberSubject.value);
            // logged in so return true
            return true;
        }
        console.log('AuthenticationService: canActivate --> no');

        // not logged in so redirect to login page with the return url
        //console.log('AuthenticationService: canActivate --> no : ', state.url);
        //this.router.navigate(['/authentication'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    console.log('AuthGuard: CanActivateFn');
    console.log('AuthGuard: CanActivateFn -> next', next);
    console.log('AuthGuard: CanActivateFn -> state', state);
    return inject(AuthenticationService).canActivate(next, state);
}


