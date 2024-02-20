import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


import { AppConfiguration } from "read-appsettings-json";
import { map } from 'rxjs/operators';

//const baseUrl = 'http://localhost:8080/api/inventory';
//const baseUrl = 'http://192.168.1.193:8080/api/inventory';


const baseUrl = `${AppConfiguration.Setting().Application.serverUrl}` + "/api/logging";

@Injectable({
    providedIn: 'root',
})



export class LoggingService  {

    constructor(
        private http: HttpClient,
    ) { }

    logging(log: string){
        return this.http.post<any>(`${baseUrl}/log`, {
            log
        })       
    };

        

    logEntry(method_name: string, variable_name:string , value: any ){

        var message = "\"" + method_name + "\" : { \"" +  variable_name + "\" : ";
        if( typeof value === "string" ){
          message += "\"" + value + "\"";
        }
        else {
          message += value;
        }
        message += " }";

        this.logging(message).subscribe({
          next: (v) => {
            console.log('loggingService::logEntry', v);
          },
          error: (e) => {
            console.log('error', e);
          },
          complete: () => {
            console.log("complete");
          }
        });
  
    }    

}