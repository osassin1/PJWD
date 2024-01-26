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


const baseUrl = 'http://localhost:8080/api/family_member';
//const baseUrl = 'http://127.0.0.1:3000/api/family_member';

@Injectable({
    providedIn: 'root',
})

export class AuthenticationService {
    private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    public familyMember: Observable<FamilyMember | null>;

    private authenticated=false;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        console.log('AuthenticationService::in constructor');
        this.familyMemberSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('familyMember')!));
        console.log('AuthenticationService::BehaviorSubject :' + JSON.parse(localStorage.getItem('familyMember')!) );
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

    // login(username:string, password:string): Observable<FamilyMember>{
    //     return this.http.post<FamilyMember>(`${baseUrl}/login`, {
    //         username, 
    //         password
    //     });
    // }

    login(username:string, password:string) {
        console.log("AuthenticationService: login");
        return this.http.post<FamilyMember>(`${baseUrl}/login`, {
            username, 
            password
        }).pipe(map(familyMember => {
            console.log("AuthenticationService: login in }).pipe(map(familyMember =>");
            console.log(familyMember);
            localStorage.setItem('familyMember', JSON.stringify(familyMember));
            this.familyMemberSubject.next(familyMember);
            return familyMember;            
        }));
    };

    logout(){
        console.log("AuthenticationService: logout");
        console.log(localStorage.getItem('familyMember'));
        //localStorage.clear();
        localStorage.removeItem('familyMember');
        this.familyMemberSubject.next(null);
        //this.familyMemberSubject.closed;
        this.router.navigate(['/authentication']);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean {
        console.log('AuthenticationService: canActivate');
        const familyMember = this.familyMemberValue;
        console.log(familyMember);

        if (familyMember) {
            console.log('canActivate familyMember :');
            console.log(familyMember);
            // logged in so return true
            return true;
        }
        console.log('AuthenticationService: canActivate --> no');

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/authentication'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}

export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
    console.log('AuthGuard: CanActivateFn');
    return inject(AuthenticationService).canActivate(next, state);
}


