import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonRefModule } from '../../module/common-ref.module';

@Component({
  selector: 'app-shuffle-list',
  imports: [CommonModule, CommonRefModule],
  templateUrl: './shuffle-list.component.html',
  styleUrl: './shuffle-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuffleListComponent {
  @Input() items: any[] = [];
  @Input() displayField?: string;
  @Input() avatarField?: string;
  @Input() initialsFromField?: string;

  @Output() selection = new EventEmitter<any>();

  visible = false;
  isShuffling = false;
  highlightedIndex: number | null = null;
  selectedItem: any = null;

  newItem = '';
  editingIndex: number | null = null;
  editingValue = '';

  copySuccess = false;

  @ViewChild('listContainer') listContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('listItem') listItems!: QueryList<ElementRef>;
  @ViewChild('addInput') addInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  private _animReq: number | null = null;
  private _startTime = 0;
  private _targetIndex = 0;

  private readonly SHUFFLE_DURATION = 4200;

  constructor(public cd: ChangeDetectorRef) {}

  /* -------------------- Logic -------------------- */

  open() {
    this.visible = true;
    this.resetSelection();
    setTimeout(() => this.addInput?.nativeElement?.focus(), 50);
  }

  close() {
    this.visible = false;
    this.stopShuffle();
  }

  startShuffle() {
    if (this.isShuffling || !this.items.length) return;

    this.isShuffling = true;
    this.highlightedIndex = null;
    this.selectedItem = null;

    this._startTime = performance.now();
    this._targetIndex = Math.floor(Math.random() * this.items.length);

    this._animate();
  }

  private _animate = () => {
    const t = Math.min(1, (performance.now() - this._startTime) / this.SHUFFLE_DURATION);
    const ease = this.easeInOutExpo(t);

    const passes = Math.max(8, Math.floor(this.SHUFFLE_DURATION / 400));
    const index = Math.floor((this.items.length * passes + this._targetIndex) * ease) % this.items.length;

    if (index !== this.highlightedIndex) {
      this.highlightedIndex = index;
      this.scrollTo(index);
      this.cd.markForCheck();
    }

    if (t < 1 && this.isShuffling) {
      this._animReq = requestAnimationFrame(this._animate);
    } else {
      this.finishShuffle();
    }
  };

  private finishShuffle() {
    this.isShuffling = false;

    setTimeout(() => {
      this.highlightedIndex = this._targetIndex;
      this.selectedItem = this.items[this._targetIndex];
      this.selection.emit(this.selectedItem);
      this.cd.markForCheck();
    }, 120);
  }

  stopShuffle() {
    if (!this.isShuffling) return;

    this.isShuffling = false;
    if (this._animReq) cancelAnimationFrame(this._animReq);

    if (this.highlightedIndex != null) {
      this.selectedItem = this.items[this.highlightedIndex];
      this.selection.emit(this.selectedItem);
    }

    this.cd.markForCheck();
  }

  private scrollTo(index: number) {
    const el = this.listItems?.get(index)?.nativeElement;
    const container = this.listContainer?.nativeElement;
    if (!el || !container) return;

    const c = container.getBoundingClientRect();
    const e = el.getBoundingClientRect();

    if (e.top < c.top || e.bottom > c.bottom) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private easeInOutExpo(t: number): number {
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
  }

  shuffleItems() {
    if (this.isShuffling || this.items.length < 2) return;

    const shuffled = [...this.items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.items = shuffled;

    this.highlightedIndex = Math.floor(Math.random() * this.items.length);

    this.cd.markForCheck();

    setTimeout(() => {
      this.highlightedIndex = null;
      this.cd.markForCheck();
    }, 300);
  }

  /* ------------------ Utilities ------------------ */

  trackByIndex = (_: number, __: any) => _;

  display(item: any): string {
    if (!item) return '';
    return this.displayField && typeof item === 'object'
      ? item[this.displayField]
      : String(item);
  }

  addItem() {
    if (!this.newItem.trim()) return;
    this.items = [...this.items, this.displayField ? { [this.displayField]: this.newItem } : this.newItem];
    this.newItem = '';
    this.cd.markForCheck();
  }

  resetSelection() {
    this.highlightedIndex = null;
    this.selectedItem = null;
  }

  startEdit(i: number) {
    if (this.isShuffling) return;
    this.editingIndex = i;
    this.editingValue = this.display(this.items[i]);
    this.cd.markForCheck();
  }

  saveEdit(i: number) {
    const val = this.editingValue.trim();
    if (!val) return;

    const item = this.items[i];
    const updated =
      this.displayField && typeof item === 'object'
        ? { ...item, [this.displayField]: val }
        : val;

    this.items = this.items.map((v, idx) => (idx === i ? updated : v));
    this.editingIndex = null;
    this.editingValue = '';
    this.cd.markForCheck();
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editingValue = '';
    this.cd.markForCheck();
  }

  removeItem(i: number) {
    if (this.isShuffling) return;
    this.items = this.items.filter((_, idx) => idx !== i);
    if (this.highlightedIndex === i) this.resetSelection();
    this.cd.markForCheck();
  }

  copySelected() {
    if (!this.selectedItem) return;
    navigator.clipboard?.writeText(this.display(this.selectedItem));
    this.copySuccess = true;
    setTimeout(() => (this.copySuccess = false), 2000);
  }

  getAvatarUrl(item: any): string | null {
    return this.avatarField && item ? item[this.avatarField] : null;
  }

  getInitials(item: any): string {
    const text = this.display(item);
    const parts = text.split(' ');
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (!this.visible) return;

    const el = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(el.tagName)) return;

    if ((event.key === ' ' || event.key === 'Enter') && !this.isShuffling) {
      event.preventDefault();
      this.startShuffle();
    }

    if (event.key === 'Escape' && this.isShuffling) {
      event.preventDefault();
      this.stopShuffle();
    }
  }
}
