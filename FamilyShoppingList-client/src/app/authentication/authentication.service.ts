import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FamilyMember } from '../models/family_member.model';
import { Color } from '../models/color.model';


const baseUrl = 'http://localhost:8080/api/family_member';
//const baseUrl = 'http://127.0.0.1:3000/api/family_member';

@Injectable({
    providedIn: 'root',
})

export class AuthenticationService {
    private authenticated=false;

    constructor(
        private http: HttpClient
    ) {
        console.log('AuthenticationService::in constructor');
    }

    public getAuthenticated(){
        console.log('AuthenticationService::getAuthenticate=' + this.authenticated);
        return this.authenticated;
    }

    public setAuthenticated(value:boolean){
        console.log('AuthenticationService::setAuthenticated=' + value);
        this.authenticated = value;
    }

    getAll(): Observable<FamilyMember[]>{
        return this.http.get<FamilyMember[]>(baseUrl);
    }
    getAllColors(): Observable<Color[]>{
        return this.http.get<Color[]>(`${baseUrl}/colors`);
    }

    login(username:string, password:string): Observable<FamilyMember>{
        return this.http.post<FamilyMember>(`${baseUrl}/login`, {
            username, 
            password
        });
    };
}

