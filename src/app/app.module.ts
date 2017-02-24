import {BrowserModule} from '@angular/platform-browser';
import {NgModule, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {AuthComponent} from './shared/auth/auth.component';
import {AppRoutingModule} from './app-routing.module';
import {HomeComponent} from './home/home.component';
import {HttpClientModule} from '@angular/common/http';
import {RepositoryComponent} from './components/git/repository/repository.component';
import { CloneComponent } from './components/git/clone/clone.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { RemoveComponent } from './components/git/remove/remove.component';
import { BranchComponent } from './components/git/branch/branch.component';
import { StatusComponent } from './components/git/status/status.component';
import { BranchesComponent } from './components/git/branches/branches.component';
import { IsEqualStringPipe } from './pipes/is-equal-string.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuthComponent,
    HomeComponent,
    RepositoryComponent,
    CloneComponent,
    HeaderComponent,
    RemoveComponent,
    BranchComponent,
    StatusComponent,
    BranchesComponent,
    IsEqualStringPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule implements OnInit {
  ngOnInit(): void {
  }
}
