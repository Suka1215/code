/// <reference path="../../../../typings/index.d.ts"/>

namespace Ballot.Summary {

  /**
   * Controller for the ballot summary modal
   */
  export class SummaryModalController {

    /** Angular injections */
    static get $inject(): string[] {
      return ['$scope', '$state', 'ballotContentService', 'ballotStateService',
        'modalService', 'summaryModalService', 'systemStatusService'];
    }

    /**
     * Constructor.
     *
     * @param $scope angular scope
     * @param $state angular state service
     * @param ballotContent ballot content service
     * @param ballotStatus ballot state service
     * @param modal modal service
     * @param systemStatus system status service
     */
    constructor($scope: ng.IScope, private $state: ng.ui.IStateService,
      private ballotContent: Ballot.ContentService,
      private ballotState: Ballot.StateService,
      private modal: ModalService,
      private summaryModalService: SummaryModalService,
      private systemStatus: System.StatusService) {
      /* do nothing */
    }

    /**
     * Get the current zoomed state
     *
     * @return `true` if zoomed, otherwise `false`
     */
    public isZoomed(): boolean {
      return this.systemStatus.isZoomed();
    }

    /**
     * Move to revote the given contest.
     *
     * Close summary modal when revote is activated
     *
     * @param id contest ID to revote
     * @param $event angular event object
     */
    public revoteContestId(id: number, $event: ng.IAngularEvent): void {
      this.summaryModalService.closeSummaryModal();
      /* URL parameters to indicate revoting a contest */
      const urlParams = { contestId: id, revote: true };
      /* check if the card is already printed */
      const printed = !!this.$state.params['fromPrintedCard']
        || this.ballotState.isSessionFromPrintedCard();

      if (!printed && this.systemStatus.isZoomed()) {
        const index = this.ballotContent.getContestIndexForContest(id);
        this.ballotState.setCurrentContestIndex(index);
        this.$state.go('ballot.vote.zoomed', urlParams);
      } else if (!printed) {
        const index = this.ballotContent.getPageIndexForContest(id);
        this.ballotState.setCurrentPageIndex(index);
        this.$state.go('ballot.vote.default', urlParams);
      }
    }

    /**
     * Get the selected candidate IDs for the current ballot.
     *
     * @return array of selected candidate IDs
     */
    public getVoterSelections(): number[]{
      return this.ballotState.getVoterSelections();
    }

    /**
     * Creates an array of N size equal to the number of selections a voter is
     * allowed to make, minus the number of candidates that have been selected
     * Used to make ng-repeat print a specified number of unvoted candidate boxes
     *
     * @param Contest object
     * @return Empty array of 0..N size
     */
    public unvotedCandidateIterator(contest: Data.Contest): number[] {
      if (contest) {
        const numVoteable = _.get(contest, 'voteFor', 0);
        const numVoted = _(contest.candidates)
              .filter((id) => _.includes(this.getVoterSelections(), id)).value().length;
        return new Array(numVoteable - numVoted);
      }
    }
  }

  Ng.app().controller('Ballot.Summary.SummaryModalController', SummaryModalController);
}
