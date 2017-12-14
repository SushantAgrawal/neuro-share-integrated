import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `<div class="session-container">
    <div>
        <img src="assets/images/padlock.jpg">
    </div>
    <div class="message">
        <h4>Oops! We cannot service your request, please try again.</h4>
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
 * Component that shows a message if the usr is unauthorized
 */
export class UnauthorizedComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
