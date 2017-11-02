import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';
import {urlMaps} from './neuro-graph.config';
import {BrokerService} from './broker/broker.service';
@Injectable()
export class NeuroGraphService {
  global : any = {};
  moment : any;
  constructor(private activatedRoute : ActivatedRoute, private brokerService : BrokerService) {
    this.set('urlMaps', urlMaps);
    this
      .brokerService
      .init(urlMaps);
    this.moment = (moment as any).default
      ? (moment as any).default
      : moment;
    this
      .moment
      .locale('en');
    //url handling
    let searchParams = new URLSearchParams(top.location.search);
    let rawParams = searchParams.rawParams;
    let urlArray = rawParams.slice(rawParams.indexOf('?') + 1).split('&');
    let urlObject : any = urlArray.reduce((prevValue, x, i) => {
      let elementArray = x && x.split('=');
      (elementArray.length > 0) && (prevValue[elementArray[0]] = elementArray[1]);
      return (prevValue);
    }, {});
    urlObject.pom_id || (urlObject.pom_id = 82043);
    urlObject.encounter_status || (urlObject.encounter_status = 'Open');
    urlObject.csn || (urlObject.csn="865482572");
    this.set('queryParams', urlObject);

    // (() => {
    //   let sampleUrl = `https://hostname.sutterhealth.org:883/#/snapshot?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&pom_id=82043&login_id=ssambmd&login_name=TEST,DOC&department_id=23864&csn=865482572&encounter_status=Open`;
    //   let urlArray = sampleUrl.slice(sampleUrl.indexOf('?') + 1).split('&');
    //   let urlObject = urlArray.reduce((prevValue, x, i) => {
    //     let elementArray = x.split('=');
    //     prevValue[elementArray[0]] = elementArray[1];
    //     return (prevValue);
    //   }, {});
    //   this.set('queryParams', urlObject);
    // })();
  }

  get(id) {
    return (this.global[id]);
  }

  set(id, value) {
    this.global[id] = value;
  }

  test(){
    console.log('Test');
  }
}
