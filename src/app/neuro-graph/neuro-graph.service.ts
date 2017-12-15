import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams, RequestOptions, Headers } from '@angular/http';
import * as moment from 'moment';
import { SdkService, EndpointsService } from '@sutterhealth/data-services';
import { SessionService } from '@sutterhealth/user-authentication';
import { urlMaps, allMessages, applicationErrorMessages } from './neuro-graph.config';
import { BrokerService } from './broker/broker.service';

@Injectable()
export class NeuroGraphService {
  global: any = {};
  moment: any;
  msUrlBase: string;
  resourceMaps: {};
  genericErrorMessageId: string = 'data.service:error';
  genericSuccessMessageId: string = 'data.service:success';
  genericWarningMessageId: string = 'data.service:warning';

  constructor(
    private activatedRoute: ActivatedRoute,
    private sdk: SdkService,
    private endpoints: EndpointsService,
    private session: SessionService,
    private brokerService: BrokerService
  ) {

    //Initialization
    this.set('urlMaps', urlMaps);
    this.brokerService.init(urlMaps);
    this.moment = (moment as any).default ? (moment as any).default : moment;
    this.moment.locale('en');

    //url handling
    let searchParams = new URLSearchParams(top.location.search);
    let rawParams = searchParams.rawParams;
    let urlArray = rawParams.slice(rawParams.indexOf('?') + 1).split('&');
    let urlObject: any = urlArray.reduce((prevValue, x, i) => {
      let elementArray = x && x.split('=');
      (elementArray.length > 0) && (prevValue[elementArray[0]] = elementArray[1]);
      return (prevValue);
    }, {});
    // urlObject.pom_id || (urlObject.pom_id = 82043);
    // urlObject.provider_id || (urlObject.provider_id = 'G00276');
    // urlObject.csn || (urlObject.csn = "865482572");
    // urlObject.csn_status || (urlObject.csn_status = "Open");

    urlObject.pom_id || (urlObject.pom_id = 0);
    urlObject.provider_id || (urlObject.provider_id = '');
    urlObject.csn || (urlObject.csn = '');
    urlObject.csn_status || (urlObject.csn_status = '');

    this.set('queryParams', urlObject);

    //Environment Setup
    this.sdk.getEnvironment().subscribe((env: string) => {
      let url: string = '';
      if (env === 'DEV') {
        url = this.endpoints.getUrl('Dev');
        url = `${this.endpoints.getUrl('Dev')}7ea2a62b33-neuroshareapis.apiary-mock.com`;
      } else {
        url = this.endpoints.getUrl('MaestroV2');
      }
      this.msUrlBase = `${url}/neuroshare/api/internal/ms`;
    });
  }

  // Getter Setter
  get(id) {
    return (this.global[id]);
  }

  set(id, value) {
    this.global[id] = value;
  }

  // Misc methods
  pushObject(obj?: any) {
    //ToDo: Check which checkbox to be checked.
    this.brokerService.emit(allMessages.demographicEnableCheckBox, true);
  }

  // Movable Popup 
  dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
      elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  registerDrag(event) {
    function findAncestor(el, cls) {
      while ((el = el.parentNode) && el.className.indexOf(cls) < 0);
      return el;
    }
    let divToMove = findAncestor(event.target, 'cdk-overlay-pane');
    let divMarginTop = divToMove.style.marginTop;
    let divMarginLeft = divToMove.style.marginLeft;
    divToMove.style.position = 'absolute';
    if (divMarginTop) {
      divToMove.style.top = divMarginTop;
      divToMove.style.marginTop = '';
    }
    if (divMarginLeft) {
      divToMove.style.left = divMarginLeft;
      divToMove.style.marginLeft = '';
    }
    this.dragElement(divToMove);
  }

  // Http methods. To be removed later.
  httpGet(messsageId: string, params?: { name: string, value: string }[], headers?: { name: string, value: string }[], carryBag?: any) {
    //ToDo :Toggle Progress Bar
    try {
      const resourcePath = this.resourceMaps[messsageId];
      const url = `${this.msUrlBase}${resourcePath}`;
      const requestOptions = new RequestOptions();
      if (headers) {
        const objHeaders = new Headers();
        headers.map(x => objHeaders.append(x.name, x.value));
        requestOptions.headers = objHeaders;
      }
      if (params) {
        const objParams = new URLSearchParams();
        params.map(x => objParams.append(x.name, x.value));
        requestOptions.params = objParams;
      }

      // If SDK service needs the token to be passed
      // this.session.getToken().subscribe(t => {
      //   options.params.append('token', t);
      //   this.sdk._requestGetWithToken(url, options).subscribe(d => {
      //     //Send request
      //   });
      // });

      //If SDK service sets the token
      this.sdk._requestGet(url, requestOptions).subscribe(data => {
        this.brokerService.emit(messsageId, data);
      }, error => {
        this.brokerService.emit(messsageId, { error: error });
        this.brokerService.emit(this.genericErrorMessageId, { error: error });
      });

    } catch (err) {
      this.brokerService.emit(messsageId, { error: applicationErrorMessages.httpGetUnknownError });
      this.brokerService.emit(this.genericErrorMessageId, { error: applicationErrorMessages.httpGetUnknownError });
    }
  };

  httpGetMany(messsageId: string, queries: [{ resourceId: string, params?: [{ name: string, value: string }], headers?: [{ name: string, value: string }] }], carryBag?: any) {
    //ToDo :Toggle Progress Bar
    try {
      let requestCollection = queries.map(rqst => {
        const resourcePath = this.resourceMaps[rqst.resourceId];
        const url = `${this.msUrlBase}${resourcePath}`;
        const requestOptions = new RequestOptions();
        if (rqst.headers) {
          const objHeaders = new Headers();
          rqst.headers.map(x => objHeaders.append(x.name, x.value));
          requestOptions.headers = objHeaders;
        }
        if (rqst.params) {
          const objParams = new URLSearchParams();
          rqst.params.map(x => objParams.append(x.name, x.value));
          requestOptions.params = objParams;
        }
        return ({ url: url, requestOptions: requestOptions });
      });

      let emptyUrl = requestCollection.find(x => !Boolean(x.url));
      if (emptyUrl) {
        this.brokerService.emit(this.genericErrorMessageId, { error: applicationErrorMessages.idNotMappedToUrl });
        return;
      }

      let forks;

      // If SDK service needs the token to be passed
      // this.session.getToken().subscribe(t => {
      //   temp.map(x => {
      //     x.requestOptions.params.append('token', t);
      //     return this.sdk._requestGet(x.url, x.requestOptions).map(res => res.json());
      //   });
      // });

      //If SDK service sets the token
      forks = requestCollection.map(x => this.sdk._requestGet(x.url, x.requestOptions).map(res => res.json()));

      Observable.forkJoin(forks).subscribe(d => {
        d = d.map((response, i) => {
          let resourceId = queries[i].resourceId;
          let output = {};
          output[resourceId] = response;
          return (output);
        });
        this.brokerService.emit(messsageId, d);
      }, err => {
        this.brokerService.emit(messsageId, { error: err });
        this.brokerService.emit(this.genericErrorMessageId, { error: err });
      });
    } catch (err) {
      this.brokerService.emit(messsageId, { error: applicationErrorMessages.httpGetUnknownError });
      this.brokerService.emit(this.genericErrorMessageId, { error: applicationErrorMessages.httpGetUnknownError });
    }
  }
}
