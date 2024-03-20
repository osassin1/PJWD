import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, map } from 'rxjs';

import { FamilyMember } from '../models/family_member.model';
import { Color } from '../models/color.model';

import { AppConfiguration } from "read-appsettings-json";

//const baseUrl = 'http://192.168.1.193:8080/api/family_member';
//const baseUrl = 'http://localhost:8080/api/family_member'; 
//const baseUrl = 'http://127.0.0.1:3000/api/family_member';

const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/family_member";


@Injectable({
    providedIn: 'root',
})
export class AuthenticationService  {
    private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    public familyMember: Observable<FamilyMember | null>;

    family_id: number = 0;

    //private authenticated=false;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.familyMemberSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('familyMember')!));
        this.familyMember = this.familyMemberSubject.asObservable();
    }

    // public getAuthenticated(){
    //     console.log('AuthenticationService::getAuthenticate=' + this.authenticated);
    //     return this.authenticated;
    // }

    // public setAuthenticated(value:boolean){
    //     console.log('AuthenticationService::setAuthenticated=' + value);
    //     this.authenticated = value;
    // }

    public get familyMemberValue() {
        return this.familyMemberSubject.value;
    }

    getAll(family_id: number): Observable<FamilyMember[]>{
        return this.http.get<FamilyMember[]>(`${baseUrl}?family_id=${family_id}`);
    }
    getAllColors(family_id: number): Observable<Color[]>{
        return this.http.get<Color[]>(`${baseUrl}/colors?family_id=${family_id}`);
    }


    getFamilyID(family_code: string): Observable<any>{
        return this.http.get<any>(`${baseUrl}/family_id?family_code=${family_code}`);
    }

    findFamilyCode(family_code: string): Observable<any>{
        return this.http.get<any>(`${baseUrl}/family_code?family_code=${family_code}`);
    }

    getNewFamilyCode(): Observable<any>{
        return this.http.get<any>(`${baseUrl}/new_family_code`);
    }

    findUsername(username: string): Observable<any>{
        return this.http.get<any>(`${baseUrl}/username?username=${username}`);
    }

    createNewFamilyMember(username: string,
                          password: string,
                          first_name: string,
                          last_name: string,
                          color_id: number,
                          family_id: number) : Observable<FamilyMember> {
        return this.http.post<FamilyMember>(`${baseUrl}/create`, {
            username, 
            password,
            first_name,
            last_name,
            color_id,
            family_id
        });
    };

    login(username: string, password: string ) : Observable<FamilyMember> {
        return this.http.post<FamilyMember>(`${baseUrl}/login`, {
            username, 
            password
        }).pipe(map(familyMember => {
            console.log('login : ', familyMember);
            localStorage.setItem('familyMember', JSON.stringify(familyMember));
            this.familyMemberSubject.next(familyMember);
            return familyMember;            
        }));
    };



    logout(){
        console.log("AuthenticationService: logout");
        console.log(localStorage.getItem('familyMember'));

        localStorage.removeItem('familyMember');
        this.familyMemberSubject.next(JSON.parse(localStorage.getItem('familyMember')!));
        
        this.router.navigate(['/authentication']);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean {

        if (this.familyMemberSubject.value) {
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

    const authenticationService = inject(AuthenticationService);

    return authenticationService.canActivate(next, state);
}


