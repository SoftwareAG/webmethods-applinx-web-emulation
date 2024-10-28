import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLoggerServerService } from "ngx-logger";

@Injectable()
export class AuthTokenServerService extends NGXLoggerServerService {

    protected override alterHttpRequest(httpRequest: HttpRequest<any>): HttpRequest<any> {
        // Alter httpRequest by adding auth token to header 
        httpRequest = httpRequest.clone({
            setHeaders: {
                ['Authorization']: this.getAuthToken(),
            },
        });
        return httpRequest;
    }

    getAuthToken(): string {
        return 'Bearer ' + sessionStorage.getItem('gx_token');
    }

}