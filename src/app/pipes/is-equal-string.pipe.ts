import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'isEqualString'
})
export class IsEqualStringPipe implements PipeTransform {

  transform(value: string, value2: string): string {
    if (value.localeCompare(value2) === 0) {
      value = value + ' (current)'
    }
    return value
  }

}
