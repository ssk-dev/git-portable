import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {BranchSourceEnum, IBranch, IBranchFromSource} from '../git.interfaces';
import {Subject} from 'rxjs/internal/Subject';
import {GitService} from '../../../services/git.service';

@Component({
  selector: 'git-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit, OnDestroy {
  public branches: IBranch[];
  public branch: IBranch;
  public currentBranch: IBranchFromSource;
  public localBranches: IBranchFromSource[];
  public activeBranch: IBranchFromSource;
  public selectedLocalBranch: string;
  private destroy$$ = new Subject<void>();

  constructor(public gitService: GitService) {
    this.gitService.originBranches$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branches: IBranch[]) => {
        this.branches = branches
      });

    this.gitService.localBranches$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranchFromSource[]) => {
        this.localBranches = branch
      });

    this.gitService.activeBranch$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranchFromSource) => {
        this.activeBranch = branch
      })
    this.gitService.selectedBranch$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranchFromSource) => {
        this.currentBranch = branch
      })
  }

  ngOnInit() {
  }

  public jsonParse(value: string): IBranch {
    return JSON.parse(value);
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  public setBranch(event: Event): void {
    const branch = (event.target as HTMLSelectElement).value;
    const source = (event.target as HTMLSelectElement).selectedOptions[0].className; // origin || local
    const currentBranch: IBranchFromSource = {
      name: this.jsonParse(branch).name,
      source: source === 'origin' ? BranchSourceEnum.origin : BranchSourceEnum.local
    };
    this.gitService.selectedBranch = currentBranch;

    if (source === 'origin') {
      this.gitService.getOriginBranchData(currentBranch.name)
    } else {
      this.gitService.branch = undefined;
    }
  }

  // private getBranchData(source: string): void {
  //   if (source === 'origin') {
  //     this.gitService.getOriginBranchData(currentBranch.name)
  //   } else {
  //     this.gitService.branch = undefined;
  //   }
  // }
}
