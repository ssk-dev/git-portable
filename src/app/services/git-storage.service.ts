import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {Subject} from 'rxjs/internal/Subject';

declare var require: any;
const environment = require('../../server/config');

@Injectable({
  providedIn: 'root'
})
export class GitStorageService implements OnDestroy {

  private destroy$$ = new Subject();

  private repositoryCloned$$ = new Subject();
  public repositoryCloned$ = this.repositoryCloned$$.asObservable();
  private repositoryRemoved$$ = new Subject();
  public repositoryRemoved$ = this.repositoryRemoved$$.asObservable();

  private error$$ = new Subject();
  public error$ = this.error$$.asObservable();

  private ssh_key$$ = new BehaviorSubject<string>('');
  public ssh_key$ = this.ssh_key$$.asObservable();

  constructor(private http: HttpClient) {
    this.ssh();
  }

  public remove(repository: string, both?: boolean): void {
    this.http.post(environment.config.express.url + environment.endpoint.git.remove, {repository}).subscribe(() => {
      this.repositoryRemoved$$.next();
    })
  }

  public clone(repository: string): void {
    this.http.post(environment.config.express.url + environment.endpoint.git.clone, {repository}).subscribe(() => {
      this.repositoryCloned$$.next();
    })
  }

  public status(): void {
    this.http.post(environment.config.express.url + environment.endpoint.git.status, {}).subscribe((data) => {
      console.log(data)
    })
  }

  public ssh(): void {
    this.http.post('http://localhost:9999/ssh', {command: 'ssh', repository: 'repository'}).subscribe(data => {
      this.ssh_key$$.next(data['status']);
    });
  }

  ngOnDestroy(): void {
  }
}
