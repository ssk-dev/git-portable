import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {IUser} from '../../../services/auth.interface';
import {SocketIoService} from '../../../services/socket-io.service';
import {Message} from '@angular/compiler/src/i18n/i18n_ast';
import {Action} from 'rxjs/internal/scheduler/Action';

@Component({
  selector: 'git-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public user: IUser;
  organizationData;
  ioConnection: any;
  constructor(private authService: AuthService, private socketService: SocketIoService) {
    this.authService.user$.subscribe((user) => this.user = user);
    // this.authService.organizationData$.subscribe(data => this.organizationData = data);
  }

  ngOnInit() {
    this.initIoConnection();
  }

  logout() {
    this.authService.logout();
  }
  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: Message) => {
        console.log('wbsocket message', message );
      });

    // this.socketService.onEvent(Event.CONNECT)
    //   .subscribe(() => {
    //     console.log('connected');
    //   });
    //
    // this.socketService.onEvent(Event.DISCONNECT)
    //   .subscribe(() => {
    //     console.log('disconnected');
    //   });
  }

}
