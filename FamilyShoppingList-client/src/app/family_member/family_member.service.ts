import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FamilyMember } from '../models/family_member.model';
import { Color } from '../models/color.model';

import { AppConfiguration } from "read-appsettings-json";


const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/family_member";


@Injectable({
    providedIn: 'root',
})

export class FamilyMemberService {

    constructor(
        private http: HttpClient
    ) { }


    // getAll(family_id: number): Observable<FamilyMember[]> {
    //     return this.http.get<FamilyMember[]>(`${baseUrl}?family_id=${family_id}`);
    // }
    getAllColors(family_id: number): Observable<Color[]> {
        return this.http.get<Color[]>(`${baseUrl}/colors?family_id=${family_id}`);
    }
    getFamilyID(family_code: string): Observable<any> {
        return this.http.get<any>(`${baseUrl}/family_id?family_code=${family_code}`);
    }
    findFamilyCode(family_code: string): Observable<any> {
        return this.http.get<any>(`${baseUrl}/family_code?family_code=${family_code}`);
    }
    getNewFamilyCode(): Observable<any> {
        return this.http.get<any>(`${baseUrl}/new_family_code`);
    }
    findUsername(username: string): Observable<any> {
        return this.http.get<any>(`${baseUrl}/username?username=${username}`);
    }

    createNewFamilyMember(username: string,
        password: string,
        first_name: string,
        last_name: string,
        color_id: number,
        family_id: number): Observable<FamilyMember> {
        return this.http.post<FamilyMember>(`${baseUrl}/create`, {
            username,
            password,
            first_name,
            last_name,
            color_id,
            family_id
        });
    };
}

