import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {urlMaps} from './neuro-graph.config';
import {BrokerService} from './broker/broker.service';
@Injectable()
export class NeuroGraphService {
  global : any = {};
  constructor(private activatedRoute : ActivatedRoute, private brokerService : BrokerService) {
    this.set('urlMaps', urlMaps);
    this.brokerService.init(urlMaps);
    // Comment out following self executable function in production or when actual
    // url is available
    (() => {
      let sampleUrl = `https://hostname.sutterhealth.org:883/#/snapshot?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&pom_id=82043&login_id=ssambmd&login_name=TEST,DOC&department_id=23864&csn=865482572&encounter_status=Open`;
      let urlArray = sampleUrl.slice(sampleUrl.indexOf('?') + 1).split('&');
      let urlObject = urlArray.reduce((prevValue, x, i) => {
        let elementArray = x.split('=');
        prevValue[elementArray[0]] = elementArray[1];
        return (prevValue);
      }, {});
      this.set('queryParams', urlObject);
    })();
    // this.doInit();
    // uncomment following code for production or when actual url is available let
    // sub = this   .activatedRoute   .queryParams   .subscribe(q => {
    // this.set('queryParams', q);   });

  }

  // doInit(){

  // }

  get(id) {
    return (this.global[id]);
  }

  set(id, value) {
    this.global[id] = value;
  }

}
