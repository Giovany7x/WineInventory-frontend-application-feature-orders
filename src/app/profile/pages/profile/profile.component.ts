import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { finalize, filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PlanBenefitsComponent } from '../../components/plan-benefits/plan-benefits.component';
import { PlanDetailsComponent } from '../../components/plan-details/plan-details.component';
import { ProfileEditComponent, ProfileFormValue } from '../../components/profile-edit/profile-edit.component';
import { ProfileService } from '../../services/profile.service';
import { AccountStatus, Profile, ProfileUpdateInput, SubscriptionPlan } from '../../models/profile.entity';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileEditComponent, PlanDetailsComponent, PlanBenefitsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly profile = signal<Profile | null>(null);
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly premiumBenefits = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly updateError = signal<string | null>(null);
  readonly isSettingsView = signal(false);
  readonly overviewAvatarError = signal(false);

  readonly accountStatus = computed<AccountStatus | null>(() => this.profile()?.accountStatus ?? null);
  readonly selectedPlanId = computed<string | null>(() => this.profile()?.selectedPlanId ?? null);

  constructor() {
    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed())
      .subscribe(profile => {
        this.profile.set(profile);
        this.overviewAvatarError.set(false);
      });

    this.profileService
      .getPlans()
      .pipe(takeUntilDestroyed())
      .subscribe(plans => this.plans.set(plans));

    this.profileService
      .getPremiumBenefits()
      .pipe(takeUntilDestroyed())
      .subscribe(benefits => this.premiumBenefits.set(benefits));

    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(event => this.evaluateView(event.urlAfterRedirects));

    this.evaluateView(this.router.url);
    this.fetchInitialData();
  }

  fetchInitialData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.profileService
      .refreshAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        error: () => this.loadError.set('No se pudieron cargar los datos del perfil. Intenta nuevamente más tarde.')
      });
  }

  handleProfileSave(formValue: ProfileFormValue): void {
    this.updateError.set(null);
    this.isSaving.set(true);

    this.profileService
      .updateProfile({
        ...formValue,
        lastUpdated: new Date().toISOString()
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.goToProfile(),
        error: () =>
          this.updateError.set('No pudimos guardar tus cambios en este momento. Vuelve a intentarlo más tarde.')
      });
  }

  handleCancelEdit(): void {
    this.updateError.set(null);
    this.goToProfile();
  }

  handlePlanSelected(planId: string): void {
    if (this.selectedPlanId() === planId) {
      return;
    }

    const payload = this.buildPlanUpdatePayload(planId);
    if (!payload) {
      return;
    }

    this.updateError.set(null);
    this.isSaving.set(true);

    this.profileService
      .updateProfile(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        error: () => this.updateError.set('No fue posible actualizar el plan seleccionado. Intenta nuevamente.')
      });
  }

  private buildPlanUpdatePayload(planId: string): ProfileUpdateInput | null {
    const currentProfile = this.profile();
    if (!currentProfile) {
      return null;
    }

    const payload: ProfileUpdateInput = {
      selectedPlanId: planId,
      lastUpdated: new Date().toISOString()
    };

    const nextStatus = this.profileService.buildAccountStatusForPlan(planId);
    if (nextStatus) {
      payload.accountStatus = nextStatus;
    }

    return payload;
  }

  private evaluateView(url: string): void {
    this.isSettingsView.set(url.includes('/profile/settings'));
  }

  goToSettings(): void {
    this.router.navigate(['settings'], { relativeTo: this.route }).catch(() => {
      // ignore navigation errors
    });
  }

  goToProfile(): void {
    this.router.navigate(['../'], { relativeTo: this.route }).catch(() => {
      // ignore navigation errors
    });
  }

  computeInitials(fullName: string): string {
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

  handleOverviewAvatarError(): void {
    this.overviewAvatarError.set(true);
  }
}
