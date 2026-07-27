import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ToastContainerComponent } from '../shared/toast-container.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, ToastContainerComponent],
  template: `
    <div class="app-layout">
      <app-navbar />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-toast-container />
    </div>
  `,
  styleUrl: './app-layout.css',
})
export class AppLayoutComponent {}
