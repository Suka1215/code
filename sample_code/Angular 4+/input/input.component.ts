import { Component, ElementRef, Input, OnInit, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'md-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  host: {
    class: 'md-input'
  }
})
export class InputComponent implements ControlValueAccessor, OnInit {

  @ViewChild('input', { static: false }) input: ElementRef;

  @Input() inputId: string;
  @Input() inputType: string;
  @Input() isDisabled = false;
  @Input() isRequired = true;
  @Input() label: string;
  @Input() maxLength: string;
  @Input() minLength: string;
  @Input() name: string;
  @Input() placeholder: string;
  @Input() type = 'text';
  @Input() value: string;

  constructor(@Self() public inputControl: NgControl) {
    this.inputControl.valueAccessor = this;
  }

  ngOnInit() {
    const control = this.inputControl.control;
    const validators: ValidatorFn[] = control.validator ? [control.validator] : [];
    this.isValueRequired(validators);
    this.isMinimumLengthRequired(validators);
    this.isMaximumLengthRequired(validators);
    control.setValidators(validators);
    control.updateValueAndValidity();
  }

  /**
   * Handles on value change for component
   *
   * @function onChange
   * @param {event} input value
   */
  onChange(event: Event) { }

  /**
   * Handles when input is touched
   *
   * @function onTouched
   */
  onTouched() { }

  /**
   * Handles setting on change with anon func
   *
   * @function registerOnChange
   * @param {Function} anon function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Add Category
   *
   * @function registerOnTouched
   * @param {Function} anon function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Handles current value to be wirtten
   *
   * @function writeValue
   * @param {Object} value written
   */
  writeValue(obj: any): void {
    this.input.nativeElement.value = obj;
  }

  /**
   * Set is required on input
   *
   * @function isValueRequired
   * @param {Validators} validator set
   */
  private isValueRequired(validators: ValidatorFn[]): number {
    return this.isRequired ? validators.push(Validators.required) : null;
  }

  /**
   * Set min length on input
   *
   * @function isMinimumLengthRequired
   * @param {Validators} validator set
   */
  private isMinimumLengthRequired(validators: ValidatorFn[]): number {
    return this.minLength ? validators.push(Validators.minLength(Number(this.minLength))) : null;
  }

  /**
   * Set max length on input
   *
   * @function isMaximumLengthRequired
   * @param {Validators} validator set
   */
  private isMaximumLengthRequired(validators: ValidatorFn[]): number {
    return this.maxLength ? validators.push(Validators.maxLength(Number(this.maxLength))) : null;
  }
}
