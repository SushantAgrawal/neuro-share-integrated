import {Injectable} from '@angular/core';
import {Http, URLSearchParams, Headers, RequestOptions} from '@angular/http';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {messages} from './broker.config';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/forkJoin';
// import {IQuery, IQuery1} from './model';

@Injectable()
export class BrokerService {
  subject : Subject < any >;
  urlMaps : {};
  constructor(private http : Http) {
    this.subject = new Subject();
  }

  init(urlMaps) {
    this.urlMaps = urlMaps;
  }
  //application wide events
  emit(id : string, options?: any) {
    this
      .subject
      .next({id: id, data: options});
  };

  filterOn(id : string) : Observable < any > {
    return(this.subject.filter(d => (d.id === id)));
  };

  httpPost(id : string, body?: any) {
    let url = this.urlMaps[id];
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this
      .http
      .post(url, body, {headers: headers})
      .map(response => response.json())
      .subscribe(d => {
        this
          .subject
          .next({id: id, data: d, body: body});
      }, err => {
        this
          .subject
          .next({
            id: id,
            data: {
              error: err
            }
          });
      });
  };

  httpGet(id : string, queryParams?: [any], headers?: [any], carryBag?: any) {
    try {
      let url = this.urlMaps[id];
      let myParams = new URLSearchParams();
      queryParams && (queryParams.map(x => myParams.append(x.name, x.value)));

      let myHeaders = new Headers();
      headers && (headers.map(x => myHeaders.append(x.name, x.value)));
      let options;
      (headers || queryParams) && (options = new RequestOptions({
        headers: headers
          ? myHeaders
          : null,
        params: queryParams
          ? myParams
          : null
      }));
      if (url) {
        this
          .http
          .get(url, options)
          .map(response => response.json())
          .subscribe(d => {
            this
              .subject
              .next({id: id, data: d, carryBag: carryBag});
          }, err => {
            this
              .subject
              .next({id: id, error: err});
          });
      } else {
        this
          .subject
          .next({id: id, error: messages.idNotMappedToUrl})
      }
      //this.httpGetMany("test",[{urlId:"test",queryParams:null,headers:[{name:"",valu
      //e:""}]}])
    } catch (err) {
      this
        .subject
        .next({id: id, error: messages.httpGetUnknownError})
    }
  };

  httpGetMany(messsageId : string, queries : [
    {
      urlId: string,
      queryParams?: [
        {
          name: string,
          value: string
        }
      ],
      headers?: [
        {
          name: string,
          value: string
        }
      ]
    }
  ], carryBag?: any) {
    try {

      let temp = queries.map(t => {
        let url = this.urlMaps[t.urlId];
        let myParams = new URLSearchParams();
        t.queryParams && (t.queryParams.forEach(x => myParams.append(x.name, x.value)));

        let myHeaders = new Headers();
        t.headers && (t.headers.forEach(x => myHeaders.append(x.name, x.value)));

        let options;

        (t.headers || t.queryParams) && (options = new RequestOptions({
          headers: t.headers
            ? myHeaders
            : null,
          params: t.queryParams
            ? myParams
            : null
        }));
        return ({url: url, options: options});
      });
      let emptyUrl = temp.find(x => !Boolean(x.url));
      if (emptyUrl) {
        this
          .subject
          .next({id: messsageId, error: messages.idNotMappedToUrl});
        return;
      }
      let forks = temp.map(x => this.http.get(x.url, x.options).map(res => res.json()));

      Observable
        .forkJoin(forks)
        .subscribe(d => {
          d = d.map((x, i) => {
            let urlId = queries[i].urlId;
            let y = {};
            y[urlId] = x;
            return (y);
          });
          this
            .subject
            .next({id: messsageId, data: d, carryBag: carryBag});
        }, err => {
          this
            .subject
            .next({id: messsageId, error: err});
        });

    } catch (err) {
      this
        .subject
        .next({id: messsageId, error: messages.httpGetUnknownError})
    }
  }

  httpPut(id : string, body?: any) {
    let url = this.urlMaps[id];
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this
      .http
      .put(url, body, {headers: headers})
      .map(response => response.json())
      .subscribe(d => this.subject.next({id: id, data: d, body: body}), err => this.subject.next({
        id: id,
        data: {
          error: err
        }
      }));
  };
}