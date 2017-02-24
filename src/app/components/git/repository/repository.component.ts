import {Component, OnDestroy, OnInit} from '@angular/core';
import {IRepository} from '../git.interfaces';
import {GitService} from '../../../services/git.service';
import {Subject} from 'rxjs/internal/Subject';
import {takeUntil} from 'rxjs/operators';
import {StorageService} from '../../../services/storage.service';

@Component({
  selector: 'git-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit, OnDestroy {

  public repositories: IRepository[];
  public repository: IRepository;
  private destroy$$ = new Subject<void>();

  constructor(public gitService: GitService, private storageService: StorageService,) {
  }

  ngOnInit(): void {
    this.gitService.repositories$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((repositories: IRepository[]) => {
        this.repositories = repositories
      })
    this.gitService.repository$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((repository: IRepository) => {
        this.repository = repository
      })
  }

  public jsonParse(value: string): IRepository {
    return JSON.parse(value);
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public openDir() {
    this.storageService.openDir(this.repository.name);
  }
}
