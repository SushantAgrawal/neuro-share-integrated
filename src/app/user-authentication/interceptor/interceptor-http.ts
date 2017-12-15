import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';
import { HttpInterceptorService } from 'ng-http-interceptor';
import { SessionService } from '../services/session.service';
@Injectable()
/**
 * Http Interceptor to add a token header if necesary
 */
export class InterceptorHttp {
  token: string = '';
  tokenParam: string = '';
  paramToken: boolean = true;
  constructor(
    private httpInterceptor: HttpInterceptorService,
    private defaultOptions: RequestOptions,
    private route: ActivatedRoute,
    private session: SessionService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.tokenParam = params['token'];
        if (this.paramToken) {
          this.token = this.tokenParam;
        }
      }
    });
    this.session.getToken().subscribe(token => {
      if (token) {
        this.paramToken = false;
        this.token = token;
      } else {
        this.paramToken = true;
        this.token = this.tokenParam;
      }
    });

  }
/**
 * Start to intercept all of Http Calls and add a token if exists
 */
  start() {
    this.httpInterceptor.request().addInterceptor((data: any, method: any) => {
      let headersAvailable: boolean = false;
      for (let option of data) {
        if (option instanceof RequestOptions) {
          headersAvailable = true;
          if (this.token !== '') {
            let header = new Headers();
            header.append('X-AUTH-TOKEN', this.token);
            option['headers'] = header;
          }
        }
      }

      if (!headersAvailable) {
        let options = new RequestOptions();
        options.headers = new Headers();
        if (this.token !== '') {
          options.headers.append('X-AUTH-TOKEN', this.token);
          data[data.length] = options;
        }
      }
      return data;
    });
  }

}