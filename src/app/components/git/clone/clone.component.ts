import {Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {GitService} from '../../../services/git.service';
import {GitStorageService} from '../../../services/git-storage.service';
import {IRepository} from '../git.interfaces';

@Component({
  selector: 'git-clone',
  templateUrl: './clone.component.html',
  styleUrls: ['./clone.component.scss']
})
export class CloneComponent implements OnInit {
  @Input() public repository: IRepository;
  @ViewChild('clonedSuccess', {static: true}) public clonedSuccess: ElementRef;
  userRepo: IRepository;

  constructor(private authService: AuthService,
              private gitService: GitService,
              public gitStorageService: GitStorageService,
              private renderer: Renderer2) {

    this.gitService.repository$.subscribe((data: IRepository) => {
      this.userRepo = data;
    })

    this.gitStorageService.repositoryCloned$.subscribe((done) => {
      this.renderer.addClass(this.clonedSuccess.nativeElement, 'success');
      setTimeout(() => {
        this.renderer.removeClass(this.clonedSuccess.nativeElement, 'success')
      }, 5000)
    });
  }

  ngOnInit() {
  }

}
