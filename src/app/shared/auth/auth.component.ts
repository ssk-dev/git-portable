import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})

export class AuthComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((param: Params) => {
      const code = param['code'];
      this.authService.authenticate(code);
    });
  }
}
