import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private http: HttpClient) {
  }

  public createRootDir(): void {
    this.http.post('http://localhost:9999/create/root', {root: '/git-repositories'}).subscribe(data => {
      console.log('data', data)
    })
  };

  public openDir(dir: string): void {
    this.http.post('http://localhost:9999/folder/open', {folder: dir}).subscribe(data => {
      console.log('data', data)
    })
  };

  public readDir(dir: string): void {
    this.http.get('http://localhost:9999/dir/' + dir).subscribe((data) => {
      console.log(data)
    })
  };

}
