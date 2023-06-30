// See: https://github.com/microsoft/TypeScript/wiki/Breaking-Changes#workarounds-1

import {AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {EventEmitter} from "@angular/core";


export type KeysOfType<TObj, TProp, K extends keyof TObj = keyof TObj> = K extends K ? TObj[K] extends TProp ? K : never : never;

/**
 * General function available to copy nested objects deeply
 * See: https://javascript.plainenglish.io/deep-clone-an-object-and-preserve-its-type-with-typescript-d488c35e5574
 * @param The object to be copied
 */
export function deepCopy<T>(source: T): T {
  return Array.isArray(source)
    ? source.map(item => deepCopy(item))
    : source instanceof Date
      ? new Date(source.getTime())
      : source && typeof source === 'object'
        ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
          Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop)!);
          o[prop] = deepCopy((source as { [key: string]: any })[prop]);
          return o;
        }, Object.create(Object.getPrototypeOf(source)))
        : source as T;
}

/***
 * Validates complete angular reactive from groups with child objects and updates the ui
 * @param form
 */
export function formValidate(form: UntypedFormGroup | UntypedFormArray) {
  Object.entries(form.controls).forEach(([key, control]: [string, AbstractControl]) => {
    if (control instanceof UntypedFormControl) {
      control.markAsTouched({onlySelf: true});
    } else if (control instanceof UntypedFormGroup || control instanceof UntypedFormArray) {
      this.validate(control);
    }
  });
}
