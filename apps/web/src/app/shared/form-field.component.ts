import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-field">
      @if (label()) {
        <label class="form-label" [for]="id">{{ label() }}</label>
      }
      <div class="input-wrapper" [class.input-error]="!!error()" [class.input-focused]="focused">
        @if (icon()) {
          <span class="input-icon">{{ icon() }}</span>
        }
        <input
          [id]="id"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value"
          [disabled]="disabled"
          (input)="onInput($event)"
          (focus)="focused = true"
          (blur)="focused = false; onTouched()"
          class="form-input"
        />
      </div>
      @if (error()) {
        <span class="error-text">{{ error() }}</span>
      }
    </div>
  `,
  styles: [`
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
    }
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--color-surface);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 0 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-wrapper:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(27, 73, 101, 0.1);
    }
    .input-wrapper.input-error {
      border-color: var(--color-danger);
    }
    .input-wrapper.input-error:focus-within {
      box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
    }
    .input-icon {
      font-size: 1rem;
      color: var(--color-text-muted);
      flex-shrink: 0;
    }
    .form-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 12px 0;
      font-size: 0.938rem;
      color: var(--color-text);
      font-family: inherit;
    }
    .form-input::placeholder {
      color: var(--color-text-muted);
    }
    .form-input:disabled {
      opacity: 0.5;
    }
    .error-text {
      font-size: 0.75rem;
      color: var(--color-danger);
      font-weight: 500;
    }
  `],
})
export class FormFieldComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly icon = input<string>('');
  readonly error = input<string>('');

  id = `field-${Math.random().toString(36).slice(2, 8)}`;
  value = '';
  disabled = false;
  focused = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
