import * as _ from 'lodash';
import { AccessControlOptions, Toggle, LessonDetails } from 'app/shared/interfaces/lesson';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Lesson } from 'app/shared/models/lesson';
import { LessonService } from 'app/shared/services/lesson.service';
import { NotifyService } from 'app/shared/notification.service';
import { Observable } from 'rxjs/Observable';
import { TOGGLE_ITEMS } from 'app/shared/constants/lesson';
import { Topic } from 'app/shared/models/topic';
import { TopicService } from 'app/shared/courses/topics/topic.service';

@Component({
  selector: 'md-admin-lesson-meta',
  templateUrl: './lesson-meta.component.html',
  styleUrls: ['./lesson-meta.component.scss']
})
export class LessonMetaComponent implements OnInit {

  subTopics: Topic[];
  color: string;
  lessonData: Lesson;
  selectedCourse: string;
  accessControlOptions: AccessControlOptions[] = [{ name: 'basic' }, { name: 'premium' }];
  toggleItems: Toggle[] = TOGGLE_ITEMS;
  lessonCategories: string[] = [];

  constructor(private activatedRoute: ActivatedRoute, private lessonService: LessonService,
    private notify: NotifyService, private topicService: TopicService) { }

  /**
   * @function isCategories
   *
   * @return true if categories, otherwise false
   */
  public isCategories(): boolean {
    return this.lessonCategories.length >= 1;
  }

  /**
   * Add Category
   *
   * @function addCategory
   * @param {string} category name
   */
  public addCategory(category: string) {
    if (!this.lessonCategories.includes(category)) {
      this.lessonCategories.push(category);
      this.notify.failureMessage(`Category already exist`);
    } else {
      this.notify.successMessage('No category was entered');
    }
  }

  /**
   * Create lesson details
   *
   * @function createDetails
   * @param {lessonDetails} lesson details
   */
  public createDetails(lessonDetails: LessonDetails) {
    const lessonCategories = this.lessonCategories;
    const fomrattedLessonDetails = { ...lessonDetails.value, lessonCategories };
    this.lessonService.setLessonData(fomrattedLessonDetails);
  }

  /**
  * @function getLessonCategories
  *
  * @return obervable of lesson categories
  */
  public getLessonCategories(): Observable<string[]> {
    return Observable.of(this.lessonCategories);
  }

  /**
   * Remove category
   *
   * @function removeCategory
   * @param {string} category
   */
  public removeCategory(category: string) {
    _.pull(this.lessonCategories, `${category}`);
  }

  /**
   * @function trackByFn
   *
   * @param {number} item index
   */
  public trackByFn(index: number) {
    return index;
  }

  /**
   * Angular lifecycle hook
   *
   * @function ngOnInit angular on init handler
   */
  ngOnInit() {
    this.selectedCourse = this.activatedRoute.parent.snapshot.params['course'];
    this.color = this.activatedRoute.parent.snapshot.params['color'];
    this.lessonData = this.lessonService.getLessonData();
    this.topicService.getAllCourseSubTopics(this.selectedCourse).valueChanges().subscribe(topics => {
      this.subTopics = topics;
    });
  }

}
