import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from '../client.model';

export class AuthenticationService {
    //private clientSubject: BehaviorSubject<Client | null>;
    //public client: Observable<Client | null>;
    private authenticated=false;

    constructor(
        //private router: Router,
        //private http: HttpClient
    ) {
        //this.clientSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('client')!));
        //this.client = this.clientSubject.asObservable();
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

}

