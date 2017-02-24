import {Injectable} from '@angular/core';

import * as socketIo from 'socket.io-client';
import {Message} from '@angular/compiler/src/i18n/i18n_ast';
import {Observable} from 'rxjs/internal/Observable';

const SERVER_URL = 'http://localhost:10000';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private socket;

  public initSocket(): void {
    this.socket = socketIo(SERVER_URL);
  }

  public send(message: Message): void {
    this.socket.emit('message', message);
  }

  public onMessage(): Observable<Message> {
    return new Observable<Message>((observer) => {
      this.socket.on('message', (data: Message) => observer.next(data));
    });
  }

  public onEvent(event: Event): Observable<any> {
    return new Observable<Event>((observer) => {
      this.socket.on(event, () => observer.next());
    });
  }
}
