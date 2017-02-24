import {Router} from '@angular/router';
import {Injectable} from '@angular/core';

import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {HttpService} from './http.service';
import {IUser} from './auth.interface';

declare var require: any;
const environment = require('../../server/config');

export interface IOrganization {
  avatar_url: string;
  description: null | string;
  events_url: string;
  hooks_url: string;
  id: number;
  issues_url: string;
  login: string;
  members_url: string;
  node_id: string;
  public_members_url: string;
  repos_url: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public githubUrl: string = 'https://github.com/login/oauth/authorize?client_id=' +
    environment.config.git.client_id + '&scope=user&redirect_uri=' +
    environment.config.express.redirect_uri;

  private authenticated$$ = new BehaviorSubject<boolean>(false);
  private authenticated$ = this.authenticated$$.asObservable();

  private user$$ = new BehaviorSubject<IUser>(undefined);
  public user$ = this.user$$.asObservable();
  private organizationData$$ = new BehaviorSubject<IOrganization | null>(null);
  public organizationData$ = this.organizationData$$.asObservable();

  constructor(private http: HttpClient,
              private httpService: HttpService,
              private router: Router) {
    // this.http.get('https://api.github.com/', {
    //   headers: this.httpService.httpHeaders()
    // }).subscribe((resolve: IUser) => {
    //   localStorage.setItem('git', JSON.stringify(resolve));
    // });
    if (localStorage.getItem('access_token')) {
      this.authenticated = true;
      this.init()
    }

    this.authenticated$.subscribe((authenticated: boolean) => {
      if (authenticated) {
        this.init()
      }
    })
  }

  public get user(): IUser {
    return this.user$$.getValue();
  }

  public set user(user: IUser) {
    this.user$$.next(user);
  }

  public get authenticated(): boolean {
    return this.authenticated$$.getValue();
  }

  public set authenticated(value: boolean) {
    this.authenticated$$.next(value);
  }

  public authenticate(code: string) {
    this.http.get(environment.config.express.url + '/authenticate/' + code).subscribe((response: object) => {
        const token = response['token'];
        if (token) {
          localStorage.setItem('access_token', token);
          this.authenticated = true;
          this.router.navigate(['/home']);
        } else if (response['error']) {
          this.authenticated = false;
          localStorage.removeItem('access_token');
          throw new Error(response['error'])
        }
      }
    )
  }

  public logout() {
    localStorage.removeItem('access_token');
    return this.router.navigate(['/login']);
  }

  private init() {
    this.http.get('https://api.github.com/user', {headers: this.httpService.httpHeaders()})
      .subscribe((user: IUser) => {
        console.log('user', user);
        this.user = user
      })
  }
}
