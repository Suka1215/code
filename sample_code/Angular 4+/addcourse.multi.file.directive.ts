import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import * as _ from 'lodash';

@Directive({
    selector: '[multiFileDrop]'
})
export class MultiFileDropDirective {

    @Output() filesDropped = new EventEmitter<FileList>();
    @Output() filesHovered = new EventEmitter();

    constructor() {}

    @HostListener('drop', ['$event'])
    onFileDrop($event) {
        $event.preventDefault();

        let transfer = $event.dataTransfer;
        this.filesDropped.emit(transfer.files);
        this.filesHovered.emit(false);
    }

    @HostListener('dragover', ['$event'])
    onFileDragOver($event) {
        $event.preventDefault();
        this.filesHovered.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    onFileDragLeave($event) {
        $event.preventDefault();
        this.filesHovered.emit(false);
    }

    @HostListener('dragenter', ['$event'])
    onFileDragEnter($event) {
        $event.preventDefault();
    }
}