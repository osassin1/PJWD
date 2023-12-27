import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from '../client.model';

export class AuthenticationService {
    private clientSubject: BehaviorSubject<Client | null>;
    public client: Observable<Client | null>;

    constructor(
        //private router: Router,
        //private http: HttpClient
    ) {
        this.clientSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('client')!));
        this.client = this.clientSubject.asObservable();
    }

    public get clientValue() {
        return this.clientSubject.value;
    }
}

