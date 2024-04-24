import { Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, map, interval } from 'rxjs';

import { FamilyMember } from '../models/family_member.model';

import { AppConfiguration } from "read-appsettings-json";


const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/authentication";

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService implements OnDestroy {
    private familyMemberSubject: BehaviorSubject<FamilyMember | null>;
    public familyMember: Observable<FamilyMember | null>;

    pollingTimeInMilliSeconds: number = 60000; // every minute check
    private checkAuthenticationPolling: any;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.familyMemberSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('familyMember')!));
        this.familyMember = this.familyMemberSubject.asObservable();

        // Check immediately if the loaded family member still
        // has a valid token
        this.checkAuthentication();

        // Continue checking on the token's validicity every one minuute
        this.checkAuthenticationPolling = interval(this.pollingTimeInMilliSeconds)
            .subscribe(() => {
                this.checkAuthentication();
            })

    }

    ngOnDestroy(): void {
        console.log('AuthenticationService', 'ngOnDestroy')
        this.checkAuthenticationPolling.unsubscribe();
    }

    public get isAuthenticated() {
        if (this.familyMemberSubject.value) {
            // logged in so return true
            return true;
        }
        return false;
    }

    public get familyMemberValue() {
        return this.familyMemberSubject.value;
    }

    login(username: string, password: string): Observable<FamilyMember> {
        return this.http.post<FamilyMember>(`${baseUrl}/login`, {
            username,
            password
        }).pipe(map(familyMember => {
            // login was successful
            localStorage.setItem('familyMember', JSON.stringify(familyMember));
            this.familyMemberSubject.next(familyMember);
            return familyMember;
        }));
    };

    // Call the server and provide the token - 
    // the family_id is encode within the token and the idea is
    // to check against it.
    validateToken(token: string, family_member_id: number): Observable<any> {
        return this.http.get<any>(`${baseUrl}/validate_token?token=${token}&family_member_id=${family_member_id}`);
    }

    // logout the current family member; remove data from local storage
    // and navigate back to login screen
    logout() {
        localStorage.removeItem('familyMember');
        this.familyMemberSubject.next(JSON.parse(localStorage.getItem('familyMember')!));
        this.router.navigate(['/authentication']);
    }

    // Check with the server if the current token (received during login) is
    // still valid (a token expires after a certain time) and would force a
    // re-login if invalid.
    checkAuthentication() {
        if (this.familyMemberSubject.value) {
            this.validateToken(this.familyMemberSubject.value!.token, this.familyMemberSubject.value!.family_member_id).
                subscribe({
                    next: (v) => {
                        if (!v) {
                            this.familyMemberSubject.next(null);
                            this.logout();
                        }
                        return v;
                    },
                    error: () => {
                        this.familyMemberSubject.next(null);
                        this.logout();
                        return false;
                    }
                })
        }
    }

    // The oberservale would be necessary if an async verification is used, however,
    // going back to the server and add additional roundtrips might be too much (resources, 
    // network, time).
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        if (this.familyMemberSubject.value) {
            return true;
        }
        return false;
    }
}

// This function checks if a page can be accessed or activated. It
// uses the authentication services instance that is running
// to just ensure that there is a valif family member. It does
// not verifu anything else.
export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean => {

    const authenticationService = inject(AuthenticationService);

    return authenticationService.canActivate(next, state);
}

//--- end of file ---