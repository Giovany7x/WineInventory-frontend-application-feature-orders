import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Profile } from '../../models/profile.entity';

export interface ProfileFormValue {
  fullName: string;
  email: string;
  username: string;
  phone: string;
  location: string;
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
  host: {
    class: 'card profile-card'
  }
})
export class ProfileEditComponent implements OnChanges {
  @Input({ required: true }) profile!: Profile;
  @Input() saving = false;
  @Input() errorMessage: string | null = null;

  @Output() saveProfile = new EventEmitter<ProfileFormValue>();
  @Output() cancelEdit = new EventEmitter<void>();

  private readonly formBuilder = inject(FormBuilder);

  readonly profileForm: FormGroup = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    location: ['', [Validators.required, Validators.minLength(3)]],
    currentPassword: ['', []],
    newPassword: ['', [Validators.minLength(6)]],
    confirmPassword: ['', [Validators.minLength(6)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profile'] && this.profile) {
      this.patchFormWithProfile(this.profile);
    }
  }

  get avatarInitials(): string {
    return this.computeInitials(this.profile?.fullName ?? '');
  }

  submit(): void {
    if (this.profileForm.invalid || !this.ensurePasswordsMatch()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { fullName, email, username, phone, location } = this.profileForm.value as ProfileFormValue;
    this.saveProfile.emit({ fullName, email, username, phone, location });
  }

  resetForm(): void {
    if (this.profile) {
      this.patchFormWithProfile(this.profile);
    }
    this.profileForm.get('currentPassword')?.reset('');
    this.profileForm.get('newPassword')?.reset('');
    this.profileForm.get('confirmPassword')?.reset('');
    this.cancelEdit.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private patchFormWithProfile(profile: Profile): void {
    this.profileForm.patchValue({
      fullName: profile.fullName,
      email: profile.email,
      username: profile.username,
      phone: profile.phone,
      location: profile.location
    });
  }

  private computeInitials(fullName: string): string {
    if (!fullName) {
      return 'US';
    }

    const initials = fullName
      .split(' ')
      .filter(part => part.trim().length > 0)
      .slice(0, 2)
      .map(part => part.trim().charAt(0).toUpperCase())
      .join('');

    return initials || fullName.charAt(0).toUpperCase();
  }

  private ensurePasswordsMatch(): boolean {
    const newPassword = this.profileForm.get('newPassword')?.value?.trim();
    const confirmPassword = this.profileForm.get('confirmPassword')?.value?.trim();

    if (!newPassword && !confirmPassword) {
      this.profileForm.get('confirmPassword')?.setErrors(null);
      return true;
    }

    if (newPassword !== confirmPassword) {
      this.profileForm.get('confirmPassword')?.setErrors({ mismatch: true });
      return false;
    }

    this.profileForm.get('confirmPassword')?.setErrors(null);
    return true;
  }
}
