import {Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {GitService} from '../services/git.service';
import {GitStorageService} from '../services/git-storage.service';
import {IRepository} from '../components/git/git.interfaces';
import {StorageService} from '../services/storage.service';
import {Subject} from 'rxjs/internal/Subject';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('done', {static: true}) public _d: ElementRef;
  organizationData;
  gitCommands;
  repositories: IRepository[];
  repository: IRepository;
  ssh_key: string;
  private destroy$$ = new Subject<void>();

  constructor(public authService: AuthService, private gitService: GitService, public gitStorageService: GitStorageService, private storageService: StorageService, private renderer: Renderer2) {
    this.gitService.repositories$.pipe(takeUntil(this.destroy$$)).subscribe((repositories: IRepository[]) => {
      this.repositories = repositories;
    });
    this.gitService.repository$.pipe(takeUntil(this.destroy$$)).subscribe((repository: IRepository) => {
      this.repository = repository;
    });
    this.gitStorageService.ssh_key$.pipe(takeUntil(this.destroy$$)).subscribe((key: string) => this.ssh_key = key)
  }

  ngOnInit() {
    this.gitCommands = JSON.parse(localStorage.getItem('git'))
    console.log('', JSON.parse(localStorage.getItem('git')));
  }

  public createDir() {
    this.storageService.createRootDir();
  }



  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
