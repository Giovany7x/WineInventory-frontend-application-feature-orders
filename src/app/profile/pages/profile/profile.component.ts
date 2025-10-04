import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type AccountPlan = {
  id: string;
  name: string;
  price: string;
  shortDescription: string;
  benefits: string[];
};

type AccountStatus = {
  planName: string;
  renewalDate: string;
  supportContact: string;
  statusLabel: string;
};

type ProfileFormField =
  | 'fullName'
  | 'email'
  | 'username'
  | 'currentPassword'
  | 'newPassword'
  | 'confirmPassword';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  readonly sidebarLinks = [
    { icon: 'home', label: 'Inicio' },
    { icon: 'person', label: 'Perfil', active: true },
    { icon: 'inventory', label: 'Inventario' },
    { icon: 'shopping_cart', label: 'Pedidos' },
    { icon: 'bar_chart', label: 'Reportes' },
    { icon: 'settings', label: 'Ajustes' }
  ];

  readonly userProfile = {
    fullName: 'Juan Pérez',
    role: 'Administrador General',
    email: 'juanperez@email.com',
    phone: '+52 55 1234 5678',
    location: 'Ciudad de México, MX'
  };

  readonly accountStatus: AccountStatus = {
    planName: 'Plan Premium',
    renewalDate: '15 Marzo 2025',
    supportContact: 'soporte@wineinventory.com',
    statusLabel: 'Activo'
  };

  readonly plans: AccountPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      shortDescription: 'Gestión básica para bodegas pequeñas.',
      benefits: ['Inventario limitado', 'Reportes básicos', '1 usuario']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$18',
      shortDescription: 'Herramientas avanzadas para crecer tu negocio.',
      benefits: ['Inventario ilimitado', 'Reportes inteligentes', 'Soporte prioritario']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$39',
      shortDescription: 'Automatización total y conexión con ERP.',
      benefits: ['Integraciones avanzadas', 'Roles personalizados', 'Gerente de cuenta dedicado']
    }
  ];

  readonly premiumBenefits = [
    'Acceso a promociones exclusivas de distribuidores aliados',
    'Alertas inteligentes sobre stock crítico y rotación de productos',
    'Paneles personalizados para equipos de ventas y marketing',
    'Integración directa con herramientas de facturación y CRM',
    'Soporte prioritario 24/7 con especialistas en enología'
  ];

  readonly selectedPlanId = signal<AccountPlan['id']>('premium');

  readonly profileForm: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.profileForm = this.formBuilder.group({
      fullName: [this.userProfile.fullName, [Validators.required, Validators.minLength(3)]],
      email: [this.userProfile.email, [Validators.required, Validators.email]],
      username: ['jperez', [Validators.required, Validators.minLength(4)]],
      currentPassword: ['', [Validators.minLength(6)]],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['', [Validators.minLength(6)]]
    });
  }

  selectPlan(planId: AccountPlan['id']): void {
    this.selectedPlanId.set(planId);
  }

  submitProfileForm(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // TODO: Integrar con el servicio real cuando esté disponible.
    console.table(this.profileForm.value);
  }

  isFieldInvalid(fieldName: ProfileFormField): boolean {
    const control = this.profileForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
