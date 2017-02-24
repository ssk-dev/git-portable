import {Component, OnInit} from '@angular/core';

declare let require: any;
const environment = require('../../server/config');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public githubUrl: string = 'https://github.com/login/oauth/authorize?client_id=' +
    environment.config.git.client_id + '&scope=user&redirect_uri=' +
    environment.config.express.redirect_uri;

  constructor() {
  }

  ngOnInit() {
  }

}
