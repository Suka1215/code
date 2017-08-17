/// <reference path="../../../typings/index.d.ts"/>

namespace Ballot {

  /**
   * Controller for the zoomed ballot pages.
   */
  export class ZoomedController {

    static get $inject(): string[] {
      return ['$document', '$q', '$scope', '$timeout', '$window', 'accessibleAudioService',
        'ballotContentService', 'ballotStateAudioService', 'ballotStateService',
        'systemStatusService'];
    }

    /** Array of contests in the ballot */
    public contests: Data.Contest[];

    /**
     * Constructor.
     *
     * @param $document angular document service
     * @param $q angular promise
     * @param $scope angular scope
     * @param $timeout angular timeout service
     * @param $window angular window service
     * @param accessibleAudioService accessible audio service
     * @param contentService ballot content service
     * @param stateService ballot state service
     * @param systemStatus system status service
     */
    constructor(private $document: ng.IDocumentService,
      private $q: ng.IQService, private $scope: ng.IScope,
      private $timeout: ng.ITimeoutService, private $window: ng.IWindowService,
      accessibleAudioService: Uvc.AccessibleAudioService,
      private contentService: Ballot.ContentService,
      private stateAudioService: Uvc.BallotStateAudioService,
      private stateService: Ballot.StateService,
      systemStatus: System.StatusService) {
      /* play the idle voting audio if needed */
      if (!systemStatus.isUsingUVC()) {
        accessibleAudioService.playIdlePrompt();
        this.$scope.$on('$destroy', () => accessibleAudioService.stopAudio());
      }

      /* Load contests array */
      this.$scope.$watch(() => this.contentService.getContests(), (current, previous) => {
        if (!this.contests) {
          this.contests = current;

        }
      });

      /* Push contest to setContestFullyViewed() if no paging required. */
      this.$scope.$watch(() => this.getCurrentContestIndex(), (current, previous) => {
        this.awaitDownVisible().then(() => {
          $timeout(() => {
            if (this.hasCandidates()) {
              if (!this.isUpVisible() && !this.isDownVisible()) {
                this.setContestFullyViewed();
              }
            } else {
              this.setContestFullyViewed();
            }
          });
        });
      });
    }

    /**
     * Check down button visibility
     *
     * @return promise that down button is visible.
     */
    public awaitDownVisible(): ng.IPromise<{}> {
      const defer = this.$q.defer();
      this.$timeout(() => this.isDownVisible()).then(() => defer.resolve());
      return defer.promise;
    }

    /**
     * Pages getScrollableContent container to the (-)left.
     *
     * @param $event angular event object
     */
    public clickNext($event: ng.IAngularEvent): void {
      $(this.getScrollableContent()).css({'marginLeft' : '-=' + this.getVisibleWidth()});
      // Notify AccessibleBallot that content has changed so UVC/rocker paddle can react
      this.$scope.$emit('contentScroll', Uvc.ContentScrollDirection.Next);
      if (this.isContestFullyScrolled()) {
        this.setContestFullyViewed();
      }
    }

    /**
     * Pages getScrollableContent container to the (+)left.
     *
     * @param $event angular event object
     */
    public clickPrev($event: ng.IAngularEvent): void {
      $(this.getScrollableContent()).css({'marginLeft' : '+=' + this.getVisibleWidth()});
      // Notify AccessibleBallot that content has changed so UVC/rocker paddle can react
      this.$scope.$emit('contentScroll', Uvc.ContentScrollDirection.Previous);
    }

    /**
     * Check if the View Mode (up) button should be visible.
     *
     * @return `true` if the up button should be visible, `false` otherwise
     */
    public isUpVisible(): boolean {
      const offsetLeft = _.get(this.getScrollableContent(), 'offsetLeft', 0);
      return offsetLeft < 0;
    }

    /**
     * Check if the View More (down) button should be visible.
     *
     * @return `true` if the down button should be visible, `false` otherwise
     */
    public isDownVisible(): boolean  {
      const lastElement = this.getLastElement();
      const lastElementPosition = lastElement.clientWidth + lastElement.offsetLeft;
      return lastElementPosition > this.$window.innerWidth;
    }

    /**
     * Determine if the View More button should be flashing, indicating more candidates are
     * available to view.
     *
     * @return `true` if the button should be flashing, `false` otherwise
     */
    public isViewMoreFlashing(): boolean {
      return !this.stateService.isContestFullyViewed(this.getCurrentContestId());
    }

    /**
     * Checks if current contest has any candidates.
     *
     * @return `true` if current contest has candidates, `false` otherwise
     */
    public hasCandidates(): boolean {
      return this.contentService.hasCandidates(this.getCurrentContestId());
    }

    /**
     * Gets the heading associated with given contest, if any.
     *
     * @param contest contest for which to find a heading
     * @return heading id associated with the contest, or `null` if none
     */
    public getHeadingId(contest: Data.Contest): number {
      const heading = this.contentService.getHeadingForContest(contest.id);
      return heading ? heading.id : null;
    }

    /**
     * Determines if the given contest has a heading.
     *
     * @param contest contest for which to find a heading
     * @return `true` if the contest has a heading, `false` otherwise
     */
    public isHeadingAvailable(contest: Data.Contest): boolean {
      return !!this.getHeadingId(contest);
    }

    /**
     * Get the index of the currently-displayed contest.
     *
     * @return the current contest index.
     */
    private getCurrentContestIndex(): number {
      return this.stateService.getCurrentContestIndex();
    }

    /**
     * Get the ID of the currently-displayed contest.
     *
     * @return the current contest id.
     */
    private getCurrentContestId(): number {
      return this.contests[this.getCurrentContestIndex()].id;
    }

    /**
     * @return container for content to be paged.
     */
    private getScrollableContent(): HTMLElement {
      return _.first(this.$document.find('#horizontal-zoomed-scrollable'))
        || document.createElement('div');
    }

    /**
     * @return the last child element of getScrollableContent.
     */
    private getLastElement(): HTMLElement {
      return <HTMLElement> _.last(this.getScrollableContent().children);
    }

    /**
     * @return the width of the getScrollableContent container.
     */
    private getVisibleWidth(): number {
      return this.getScrollableContent().clientWidth;
    }

    /**
     * Check if the contest has been fully scrolled to show all of its candidates.
     *
     * @return `true` if the contest has scrolled to its last candidate
     */
    private isContestFullyScrolled(): boolean {
      const offsetLeft = _.get(this.getLastElement(), 'offsetLeft', 0);
      return offsetLeft < this.$window.innerWidth;
    }

    /**
     * Sets the contest as fully viewed.
     */
    private setContestFullyViewed(): void {
      return this.stateService.setContestFullyViewed(this.getCurrentContestId());
    }
  }

  Ng.app().controller('Ballot.ZoomedController', ZoomedController);
}
