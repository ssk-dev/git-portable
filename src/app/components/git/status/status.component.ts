import {Component, OnDestroy, OnInit} from '@angular/core';
import {GitService} from '../../../services/git.service';
import {Subject} from 'rxjs/internal/Subject';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'git-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnDestroy {
  public status: string;
  private destroy$$ = new Subject<void>();

  constructor(public gitService: GitService) {
    this.gitService.repository$.pipe(takeUntil(this.destroy$$)).subscribe(() => this.gitService.getStatus())
    this.gitService.status$.pipe(takeUntil(this.destroy$$)).subscribe((status) => this.status = status)
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }


}
