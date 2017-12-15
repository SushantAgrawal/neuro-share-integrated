import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeout',
  template: `<div class="session-container">
    <div>
        <img src="assets/images/clock.jpg" width="300px" height="300px">
    </div>
    <div class="message">
        <h4>Oops!  We have seen any activity in a while so we forwarded you to this page</h4>
    </div>
</div>`,
  styles: [`.session-container {
  margin-left: -80px !important;
  text-align: center;
  margin-top: 100px;
}
.session-container .message {
  font-size: 18px;
}
.session-container .message h4 {
  font-weight: normal;
}
.session-container > div {
  width: 100%;
  position: relative;
}
.session-container > div > img {
  width: 300px;
  height: 300px;
}
`]
})
/**
 * Component that shows a message if the usr has been inactive for a while
 */
export class TimeoutComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
