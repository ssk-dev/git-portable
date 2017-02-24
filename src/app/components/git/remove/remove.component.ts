import {Component, ElementRef, Input, Renderer2, ViewChild} from '@angular/core';
import {IRepository} from '../git.interfaces';
import {AuthService} from '../../../services/auth.service';
import {GitService} from '../../../services/git.service';
import {GitStorageService} from '../../../services/git-storage.service';

@Component({
  selector: 'git-remove',
  templateUrl: './remove.component.html',
  styleUrls: ['./remove.component.scss']
})
export class RemoveComponent {
  @Input() public repository: IRepository;
  @ViewChild('removedSuccess', {static: true}) public removedSuccess: ElementRef;
  userRepo: IRepository;

  constructor(private authService: AuthService,
              private gitService: GitService,
              public gitStorageService: GitStorageService,
              private renderer: Renderer2) {

    this.gitService.repository$.subscribe((data: IRepository) => {
      this.userRepo = data;
    })

    this.gitStorageService.repositoryRemoved$.subscribe((done) => {
      this.renderer.addClass(this.removedSuccess.nativeElement, 'success');
      setTimeout(() => {
        this.renderer.removeClass(this.removedSuccess.nativeElement, 'success')
      }, 5000)
    });
  }


}
