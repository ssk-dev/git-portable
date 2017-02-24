import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public httpHeaders(): HttpHeaders {
    return new HttpHeaders({Authorization: 'token ' + localStorage.getItem('access_token')});
  }
}
