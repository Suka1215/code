import { Directive, OnInit } from '@angular/core';
import { HighlightJsService } from 'angular2-highlight-js';
import * as _ from 'lodash';

@Directive({
    selector: '[codeHighlight]'
})

export class codeHighlightDirective implements OnInit {

    constructor(private highlightJsService: HighlightJsService) {
        console.log('highlight')

    }

    ngOnInit() {
        const element = document.body.querySelectorAll('pre.code')
        console.log(element);
        for (let i = 0; i < element.length; i++) {
        this.highlightJsService.highlight(element[i])
      }
    }

}
