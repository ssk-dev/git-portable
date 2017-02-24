import {HttpClient} from '@angular/common/http';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {Subject} from 'rxjs/internal/Subject';
import {map, takeUntil} from 'rxjs/operators';
import {BranchSourceEnum, IBranch, IBranchFromSource, IRepository, IRepositoryPermissions} from '../components/git/git.interfaces';
import {HttpService} from './http.service';
import {TimeInterval} from 'rxjs/internal/types';

declare var require: any;
const environment = require('../../server/config');

@Injectable({
  providedIn: 'root'
})
export class GitService implements OnDestroy {
  private destroy$$ = new Subject<void>();

  private repositories$$ = new BehaviorSubject<IRepository[] | undefined>(undefined);
  public repositories$ = this.repositories$$.asObservable();
  private repository$$ = new BehaviorSubject<IRepository | undefined>(undefined);
  public repository$ = this.repository$$.asObservable();

  private originBranches$$ = new BehaviorSubject<IBranch[] | undefined>(undefined);
  public originBranches$ = this.originBranches$$.asObservable();

  private localBranches$$ = new BehaviorSubject<IBranchFromSource[]>(undefined);
  public localBranches$ = this.localBranches$$.asObservable();

  private branch$$ = new BehaviorSubject<IBranch | undefined>(undefined);
  public branch$ = this.branch$$.asObservable();

  private selectedBranch$$ = new BehaviorSubject<IBranchFromSource>(undefined);
  public selectedBranch$ = this.selectedBranch$$.asObservable();

  private activeBranch$$ = new BehaviorSubject<IBranchFromSource>(undefined);
  public activeBranch$ = this.activeBranch$$.asObservable();

  private status$$ = new BehaviorSubject<string>(undefined);
  public status$ = this.status$$.asObservable();

  private permission$$ = new BehaviorSubject<IRepositoryPermissions | undefined>(undefined);
  public permission$ = this.permission$$.asObservable();

  private checkStatusInterval;

  constructor(private http: HttpClient,
              private httpService: HttpService) {
    this.init();
    this.watchChanges()
  }

  public get repositories(): IRepository[] {
    return this.repositories$$.getValue();
  }

  public set repositories(repositories: IRepository[]) {
    this.repositories$$.next(repositories);
  }

  public get repository(): IRepository {
    return this.repository$$.getValue();
  }

  public set repository(repository: IRepository) {
    this.repository$$.next(repository);
  }

  public get branches(): IBranch[] {
    return this.originBranches$$.getValue();
  }

  public set branches(branches: IBranch[]) {
    this.originBranches$$.next(branches);
  }

  public get branch(): IBranch {
    return this.branch$$.getValue();
  }

  public set branch(branch: IBranch) {
    this.branch$$.next(branch);
  }

  public get selectedBranch(): IBranchFromSource {
    return this.selectedBranch$$.getValue();
  }

  public set selectedBranch(branch: IBranchFromSource) {
    console.log('set selected branch', branch)
    this.selectedBranch$$.next(branch);
  }

  public get localBranches(): IBranchFromSource[] {
    return this.localBranches$$.getValue();
  }

  public set localBranches(branches: IBranchFromSource[]) {
    this.localBranches$$.next(branches);
  }

  public get activeBranch(): IBranchFromSource {
    return this.activeBranch$$.getValue();
  }

  public set activeBranch(branch: IBranchFromSource) {
    this.activeBranch$$.next(branch);
  }

  public get status(): string {
    return this.status$$.getValue();
  }

  public set status(value: string) {
    this.status$$.next(value);
  }

  public getRepositories(): void {
    // get all Repositories from Github
    this.http.get('https://api.github.com/user/repos', {
      headers: this.httpService.httpHeaders()
    }).subscribe((repositories: IRepository[]) => {
      this.repositories = repositories
    });
  }

  public getRepository(repository: IRepository): void {
    this.http.get(`https://api.github.com/repos/ssk-dev/${repository.name}`, {
      headers: this.httpService.httpHeaders()
    }).subscribe((_repository: IRepository) => {
      console.log('getRepository', _repository);
      this.repository$$.next(_repository)
    });
  }

  public getBranches(): void {
    const repository = this.repository;
    this.http.get(`https://api.github.com/repos/ssk-dev/${repository.name}/branches`, {
      headers: this.httpService.httpHeaders()
    }).subscribe((branches: IBranch[]) => {
      this.branches = branches;
    });
  }

  public getOriginBranchData(name: string): void {
    const repository = this.repository;
    const branch = name.length > 0 ? name : this.branch.name;
    this.http.get(`https://api.github.com/repos/ssk-dev/${repository.name}/branches/${branch}`, {
      headers: this.httpService.httpHeaders()
    }).subscribe((_branch: IBranch) => {
      this.branch = _branch
    });
  }

  public checkout(branch: IBranchFromSource, create: boolean, force: boolean): void {
    this.http.post('http://localhost:9999/git/checkout', {
      repository: this.repository.name,
      branch: branch.name,
      create,
      force
    }).subscribe((data) => {

      // Update local branchlist dropdown -> not needed to read filesystem again
      if (!this.localBranches.find((entry) => entry.name === branch.name)) {
        this.localBranches.push({name: branch.name, source: BranchSourceEnum.local});
      }

      this.activeBranch = {name: branch.name, source: BranchSourceEnum.local};

      if (create) {
        console.log('checkout new', data);
        this.getBranches();
      }

      console.log('checkout data', data);
    });

  }
  public pull(): void {
    this.http.post(environment.config.express.url + environment.endpoint.git.pull, {
      repository: this.repository.name,
    }).subscribe((data) => {
      console.log('git pull', data)
    })
  }

  public removeBranch(branch: IBranchFromSource): void {
    this.http.post('http://localhost:9999/git/remove', {
      repository: this.repository.name,
      branch: branch.name,
      source: branch.source
    }).subscribe((data) => {
      console.log('data', data)
      if (branch.source === 'origin') {
        this.getBranches();
      } else {
        this.readRepositoryDirectory(this.repository.name);
      }
      this.selectedBranch = undefined;
    })
  }

  public readRepositoryDirectory(dir: string): void {
    this.http.post('http://localhost:9999/dir/read', {path: dir + '/.git/refs/heads'})
      .pipe(map((entry: []) => {
        const entries = [];
        for (const e of entry) {
          entries.push({name: e, source: 'local'})
        }
        return entries
      }))
      .subscribe((data: IBranchFromSource[]) => {
        this.localBranches = data;
      })
  };

  public activeLocalBranch() {
    this.http.post(environment.config.express.url + environment.endpoint.git.active_branch, {
      repository: this.repository.name,
      path: '/.git/HEAD'
    })
      .subscribe((data: string) => {
        console.log(data)
        if (data['active']) {
          this.activeBranch = {name: data['active'].split('/').slice(-1)[0], source: BranchSourceEnum.local}
          // this.currentBranch = {name: data['active'].split('/').slice(-1)[0], source: BranchSourceEnum.local}
        } else {
          this.activeBranch = undefined
        }
      })
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public getStatus(): void {
    const repository = this.repository;
    this.http.post(environment.config.express.url + environment.endpoint.git.status, {repository}).subscribe((data: string) => {
      console.log(data)
      this.status = data;
    })
  }

  public openTerminal(): void {
    const repository = this.repository;
    this.http.post(environment.config.express.url + environment.endpoint.terminal, {repository}).subscribe((data: string) => {
      console.log(data)
    })
  }

  private init(): void {
    // get all Repositories from Github
    this.getRepositories();
  }

  private watchChanges(): void {
    // on repositories change -> set repository
    this.repositories$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((repositories: IRepository[]) => {
        if (repositories) {
          this.getRepository(repositories[0]);
        }
      });

    // on repository change -> set branches
    this.repository$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((repository: IRepository) => {
        if (repository) {
          this.getBranches()
          this.readRepositoryDirectory(repository.name);
          this.selectedBranch = undefined
        }
      });

    // on branches change -> set branch
    this.originBranches$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branches: IBranch[]) => {
        if (branches) {
          this.getOriginBranchData(this.branches[0].name);
          this.activeLocalBranch();
        }
      });

    // on branch change -> get active branch
    this.branch$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranch) => {
        if (branch) {
          this.activeLocalBranch();
        }
      })
    // this.checkStatusInterval = setInterval(() => this.getStatus(), 1500)
    // on selected cranch change
    // this.activeBranch$.pipe(takeUntil(this.destroy$$))
    //   .subscribe((branch: IBranchFromSource) => {
    //     console.log('active branch has changed ->', branch)
    //     this.getStatus();
    //     // if (branch) {
    //     //   this.activeLocalBranch();
    //     // }
    //   })
  }
}
