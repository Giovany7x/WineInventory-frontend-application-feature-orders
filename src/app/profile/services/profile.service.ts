import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AccountStatus, Profile, ProfileUpdateInput, SubscriptionPlan } from '../models/profile.entity';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly profileEndpoint = `${environment.apiUrl}/profiles`;
  private readonly plansEndpoint = `${environment.apiUrl}/subscriptionPlans`;
  private readonly benefitsEndpoint = `${environment.apiUrl}/premiumBenefits`;
  private readonly profileId = 'current';

  private readonly profileSubject = new BehaviorSubject<Profile | null>(null);
  private readonly plansSubject = new BehaviorSubject<SubscriptionPlan[]>([]);
  private readonly benefitsSubject = new BehaviorSubject<string[]>([]);

  getProfile(): Observable<Profile | null> {
    return this.profileSubject.asObservable();
  }

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.plansSubject.asObservable();
  }

  getPremiumBenefits(): Observable<string[]> {
    return this.benefitsSubject.asObservable();
  }

  refreshProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.profileEndpoint}/${this.profileId}`).pipe(
      tap({
        next: profile => this.profileSubject.next(profile),
        error: error => console.error('No se pudo cargar el perfil.', error)
      })
    );
  }

  refreshPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(this.plansEndpoint).pipe(
      tap({
        next: plans => this.plansSubject.next(plans),
        error: error => console.error('No se pudieron cargar los planes.', error)
      })
    );
  }

  refreshBenefits(): Observable<string[]> {
    return this.http.get<string[]>(this.benefitsEndpoint).pipe(
      tap({
        next: benefits => this.benefitsSubject.next(benefits),
        error: error => console.error('No se pudieron cargar los beneficios del plan.', error)
      })
    );
  }

  refreshAll(): Observable<{ profile: Profile; plans: SubscriptionPlan[]; benefits: string[] }> {
    return forkJoin({
      profile: this.refreshProfile(),
      plans: this.refreshPlans(),
      benefits: this.refreshBenefits()
    });
  }

  updateProfile(changes: ProfileUpdateInput): Observable<Profile> {
    if (!changes || typeof changes !== 'object') {
      return throwError(() => new Error('Los cambios proporcionados no son válidos.'));
    }

    return this.http.patch<Profile>(`${this.profileEndpoint}/${this.profileId}`, changes).pipe(
      tap({
        next: profile => this.profileSubject.next(profile),
        error: error => console.error('No se pudo actualizar el perfil.', error)
      })
    );
  }

  getProfileSnapshot(): Profile | null {
    return this.profileSubject.getValue();
  }

  getPlansSnapshot(): SubscriptionPlan[] {
    return this.plansSubject.getValue();
  }

  getBenefitsSnapshot(): string[] {
    return this.benefitsSubject.getValue();
  }

  buildAccountStatusForPlan(planId: string): AccountStatus | null {
    const profile = this.profileSubject.getValue();
    const plans = this.plansSubject.getValue();
    if (!profile || plans.length === 0) {
      return null;
    }

    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      return profile.accountStatus;
    }

    return {
      ...profile.accountStatus,
      planName: selectedPlan.name,
      statusLabel: profile.accountStatus.statusLabel || 'Activo'
    };
  }
}
