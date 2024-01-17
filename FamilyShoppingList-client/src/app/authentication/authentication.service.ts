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
    color: any[] = [];

    constructor(
        private http: HttpClient
    ) {
        //this.authenticated=false;
        console.log('AuthenticationService::in constructor');
    }

    // public get clientValue() {
    //     return this.clientSubject.value;
    // }

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
        const http_request = `${baseUrl}/colors`;
        //console.log('getAllColors(): Observable<Color[]> = http request:' + http_request);
        const color = this.http.get<Color[]>(http_request);
        //console.log('getAllColors(): Observable<Color[]> = return:' + JSON.stringify(color));
        return color;
    }
    // public get AllColors() {
    //     return this.color ;
    // }
}

