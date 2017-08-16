import { debounceTime } from 'rxjs/operator/debounceTime';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { ClipboardService } from "app/shared/copy/service/clipboard.service";
import { TopicService } from "app/shared/courses/topics/topic.service";
import { NotifyService } from '../../shared/notification.service';
import { CourseService } from '../../shared/courses/course.service';
import { UploadService } from "app/shared/uploads/upload.service";
import { HighlightJsService } from 'angular2-highlight-js';
import { Upload } from "app/shared/models/upload";
import { Topic } from "app/shared/models/topic";
import { Observable } from "rxjs/Observable";
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-addcourse',
  templateUrl: './addcourse.component.html',
  styleUrls: ['./addcourse.component.scss'],
  providers: [CourseService]
})
export class AddcourseComponent implements OnInit {

  /* Set current form course group */
  public courseGroup: Observable<string[]>;

  /* Set current form course group */
  public angularSubs: Observable<string[]>;

  /* Set current form course group */
  public firebaseSubs: Observable<string[]>;

  /* Set current form course group */
  public htmlSubs: Observable<string[]>;

  /* Set current form course group */
  public scssSubs: Observable<string[]>;

  /* Set current form course group */
  public cssSubs: Observable<string[]>;

  /* Set current form course group */
  public es6Subs: Observable<string[]>;

  /* Set current form course group */
  public rxjsSubs: Observable<string[]>;

  /* Set current form course group */
  public fsSubs: Observable<string[]>;

  /* Set current form course group */
  public tsSubs: Observable<string[]>;

  /* Set current course subject */
  public courseSubject: string;

  /* Set current form title */
  public title: string;

  /* Set current form title */
  private courseTopic: string;

  /* Init files list */
  private files: FirebaseListObservable<string[]>;

  /* Init topics list */
  private topics: Observable<Topic[]>;

  /* Set spinner visibility */
  private showSpinner: boolean = false;

  /* Set image ref */
  private imageRef: string;

  /* Set image collection */
  private imageCollection = [];

  /* Set preview enabled */
  private previewEnabled: boolean = false;

  /* Set editor content */
  private editorContent: Object;

  /* Set create course `NgForm` */
  private createCourse: NgForm;

  /* Current file upload list */
  private currentUpload: Upload;

  /* DropZone hover status */
  private dropZoneHovered: boolean = false;

  /* Set form complete */
  private formComplete: boolean = false;

  /**
   * Constructor.
   *
   * @param CourseService course service
   * @param AngularFireDatabase firebase db
   * @param NotifyService notify service
   * @param Router angular router
   */
  constructor(private courseService: CourseService,
    private db: AngularFireDatabase,
    private notify: NotifyService,
    private router: Router,
    private uploadService: UploadService,
    private renderer: Renderer2,
    private clipBoard: ClipboardService,
    private topicService: TopicService,
    private highlightJsService: HighlightJsService) {
    /* Nothing */
  }

  public getCourseGroup(courseGroup: string): string {
    console.log(courseGroup);
    return courseGroup = this.courseTopic;
  }

  /**
   * @returns `true` if not empty, otherwise `false`
   */
  public isDropZoneActive(): boolean {
    return !_.isEmpty(this.title) || !_.isEmpty(this.courseSubject) || !_.isEmpty(this.courseGroup);
  }

  /**
   * @returns a complete list of topics
   */
  public getTopics(): Observable<Topic[]> {
    return this.topics;
  }

  /**
   * @returns an array object of the current files to be displayed in the DOM
   */
  public getFiles(): FirebaseListObservable<string[]> {
    return this.files;
  }

  /**
   * @returns true if spinner is showing, otherwise `false`
   */
  public isSpinnerShowing(): boolean {
    return this.showSpinner;
  }

  /**
   * @returns a db list object of uploaded image strings
   */
  public getImages(): FirebaseListObservable<string[]> {
    return this.db.list('/lesson_images');
  }

  /**
   * Trigger dropzone event highlight when hovered with file
   * @returns true if spinner is loaded, otherwise `false`
   */
  public dropZoneState($event: boolean): boolean {
    this.dropZoneHovered = $event;
    return $event ? this.showSpinner = true : this.showSpinner = false;
  }

  /**
   * @returns code styling for all pre .code elements
   */
  public highlightCode(): void {
    console.log(performance.now());
      const element = document.body.querySelectorAll('pre.code')
      for (let i = 0; i < element.length; i++) {
      return this.highlightJsService.highlight(element[i])
    }
  }

  /**
   * Checks for files being dropped in dropzone
   * @returns to upload each file and to get its image ref
   */
  public handleFileDrop(fileList: FileList): Promise<{}> {
    this.showSpinner = true
    if (this.isDropZoneActive()) {
      let filesCount = _.range(fileList.length);
      const storageRef = this.db.app.storage().ref()
        .child(`md-uploads/md-courses/${this.courseSubject}/${this.courseGroup}`)
      let promise = new Promise(resolve => {
        _.each(filesCount, (filex) => {
          this.currentUpload = new Upload(fileList[filex]);
          this.imageCollection.push(this.currentUpload);
          storageRef.child(this.currentUpload.file.name).getDownloadURL().then(resolve => {
            this.notify.warning(`${fileList[filex].name} already exist in this location, upload failed!`);
          }).catch(err => {
            if (err) {
              _.each(this.imageCollection, (file) => {
                this.uploadService.initUpload(`md-courses/${this.courseSubject}/${this.courseGroup}`,
                  file).then(() => {
                    this.notify.success(`${file.name} was uploaded successfully`)
                    this.showSpinner = false
                    this.getImageRef(file)
                    resolve();
                  })
              });
            }
          }).then(() => {
            this.imageCollection = [];
          })
        });
      })
      return promise
    } else {
      this.notify.warning('Lesson title, course subject, and course group are required to upload lesson files.');
    }
  }

  /**
   * Set url reference
   * Push file url and name to the db to populate dom
   */
  public getImageRef(file: File): Promise<void> {
    const promise = new Promise(resolve => {
        const storageRef = this.db.app.storage().ref()
          .child(`md-uploads/md-courses/${this.courseSubject}/${this.courseGroup}/${file.name}`)
        storageRef.getDownloadURL().then(url => this.imageRef = url).then(() => {
          this.imageCollection = [];
          this.db.list('lesson_images').push({
            url: this.imageRef,
            name: file.name,
          }).then(() => {
            this.imageCollection = [];
            resolve()
          })
            .catch(err => this.notify.failure(err.message))
        })
        this.imageCollection = [];
    })
      .then(() => {
        console.log('collection cleared two')
        this.imageCollection = [];
      });
    return promise;
  }

  /**
   * @returns promise to delete all files in DB and storage
   */
  public handleClearAllFiles(): void {
    if (!_.isEmpty(this.imageCollection)) {
      const files = this.getImages().subscribe(fileRef => {
        _.each(fileRef, file => {
          console.log(file['name'])
          this.db.app.storage().ref()
            .child(`md-uploads/md-courses/${this.courseSubject}/${this.courseGroup}/${file['name']}`).delete();
        })
        this.db.list(`/lesson_images/`).remove()
          .then(() => {
            return this.notify.success('All images deleted successfully');
          })
          .catch(err => this.notify.failure(err.message));
      }).unsubscribe();
    }
  }

  /**
   * Get refernce to file by url, $key, name
   * @returns promise to delete file from storage and db
   */
  public deleteFile(url: string, $key: string, name: string): void {
    const storageRef = this.db.app.storage().refFromURL(url)
      .delete()
      .then(() => this.db.list(`/lesson_images/${$key}`).remove())
      .then(() => this.notify.success(`${name} was successfully deleted`))
      .catch(err => this.notify.failure(err.message));
  }

  /**
   * @returns a copy of the inner html
   */
  public copyToClipboard(url: string, event): Promise<{}> {
    return this.clipBoard.copy(url);
  }

  /**
   * @returns true to enter preview mode
   */
  public previewCourse(): boolean {
    this.highlightCode();
    return this.previewEnabled = true;
  }

  /**
   * @returns false to exit preview mode
   */
  public previewEditor(): boolean {
    return this.previewEnabled = false;
  }

  /**
   * Checks if lesson description is empty
   * @returns true if description is entered, else `false`
   */
  public isLongDescriptionEmpty(): boolean {
    return _.isEmpty(this.editorContent);
  }

  /**
    * Checks if course group is empty
    * @returns true if course group is entered, else `false`
    */
  public isCourseGroupEmpty(): boolean {
    return _.isEmpty(this.createCourse.value.full_course);
  }

  /**
    * Set create course equal to @param createCourse
    * Check if for is invalid or lesson details are empty
    * Create course group if course group is not empty, else `single subject`
    * Send notification if course we successfully created
    * @returns error if not, else null
    */
  public addNewCourse(createCourse: NgForm): void {
    this.createCourse = createCourse;
    if (!this.createCourse.control.valid || this.isLongDescriptionEmpty()) {
      this.notify.failure('All fields are required');
    } else if (this.createCourse.control.valid) {
      console.log(this.courseGroup);
      return this.db.list('courses/' + this.createCourse.value.subject + '/' + this.courseGroup).push({
        author: this.createCourse.value.author,
        date: Date(),
        description: this.createCourse.value.description,
        difficulty: this.createCourse.value.difficulty,
        duration: this.createCourse.value.duration,
        title: this.createCourse.value.title,
        img_url: this.createCourse.value.img_url,
        video_url: this.createCourse.value.video_url,
        longDescription: this.editorContent
      }).then((success) => {
        this.router.navigate(['/admin/list-courses']);
        this.notify.success(this.courseGroup + 'course successfully created');
        this.createCourse.resetForm();
        this.handleClearAllFiles();
      }).catch((error) => {
        this.notify.failure(error.message);
      });
    }
  }

  ngOnInit() {

    /* Set file list */
    this.files = this.getImages();

    /* Set topics list */
    this.topics = this.topicService.getCourseTopics();

    this.angularSubs = this.topicService.getSubTopics('Angular');
    this.firebaseSubs = this.topicService.getSubTopics('Firebase');
    this.tsSubs = this.topicService.getSubTopics('Typescript');
    this.htmlSubs = this.topicService.getSubTopics('Html5');
    this.scssSubs = this.topicService.getSubTopics('Scss');
    this.cssSubs = this.topicService.getSubTopics('css');
    this.es6Subs = this.topicService.getSubTopics('es6');
    this.rxjsSubs = this.topicService.getSubTopics('rxjs');
    this.fsSubs = this.topicService.getSubTopics('Fullstack');
  }
}
