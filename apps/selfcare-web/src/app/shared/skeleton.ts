import { Component, input } from '@angular/core';

@Component({
  selector: 'nova-skeleton',
  template: `@for (l of lines(); track $index) {<div class="skeleton" [style.width.%]="l"></div>}`,
})
export class Skeleton {
  readonly lines = input<number[]>([90, 70, 80]);
}
