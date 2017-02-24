import {Component, OnDestroy, OnInit} from '@angular/core';
import {BranchSourceEnum, IBranch, IBranchFromSource, IRepository} from '../git.interfaces';
import {Subject} from 'rxjs/internal/Subject';
import {GitService} from '../../../services/git.service';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'git-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit, OnDestroy {

  public sourceEnum = BranchSourceEnum;
  public branches: IBranch[];
  public branch: IBranch;
  public currentBranch: IBranchFromSource;
  public activeBranch: IBranchFromSource;
  private destroy$$ = new Subject<void>();

  constructor(public gitService: GitService) {
    this.gitService.originBranches$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branches: IBranch[]) => {
        this.branches = branches
      });

    this.gitService.branch$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranch) => {
        this.branch = branch
      });

    this.gitService.selectedBranch$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranchFromSource) => {
        this.currentBranch = branch;
      });

    this.gitService.activeBranch$.pipe(takeUntil(this.destroy$$))
      .subscribe((branch: IBranchFromSource) => {
        this.activeBranch = branch;
      })
  }

  ngOnInit(): void {

  }

  public jsonParse(value: string): IBranch {
    return JSON.parse(value);
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
