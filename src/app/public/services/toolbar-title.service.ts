import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, map, Subject, takeUntil} from 'rxjs';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

/**
 * Service for managing and updating the title of the toolbar.
 *
 * Features:
 * - Listens to route changes and updates the title accordingly the route data.
 * - Allows manual title update from any component.
 *
 * Usage:
 * - Inject this service into any component that needs to manage the toolbar title.
 * - Use the `updateTitle` method to set a new title.
 *
 * @Author: Farid Coronel
 */
@Injectable({providedIn: 'root'})
export class ToolbarTitleService {

  /**
   * BehaviorSubject to store and emit the current title
   * Initialized with an empty string as default value.
   */
  private titleSource = new BehaviorSubject<string>('');

  /**
   * Subject to manage the lifecycle of the service and unsubscribe from observables.
   * Used to prevent memory leaks by ensuring that subscriptions are cleaned up when the service is destroyed.
   */
  private destroy$ = new Subject<void>();

  /**
   * Observable to expose the current title to other components.
   * Components can subscribe to this observable to get updates when the title changes.
   */
  currentTitle$ = this.titleSource.asObservable();

  /**
   * Constructor for the ToolbarTitleService.
   * Sets up a route listener to update the title based on the current route.
   *
   * @param router - Angular Router instance for navigation events.
   * @param activatedRoute - Angular ActivatedRoute instance for accessing route data.
   */
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.setupRouteListener();
  }

  /**
   * Sets up a listener for route changes.
   * When the route changes, it checks if the route has a title in its data and updates the title accordingly.
   */
  private setupRouteListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getDeepestChildRoute(this.activatedRoute)),
      filter(route => route.outlet === 'primary'),
      takeUntil(this.destroy$)
    ).subscribe(route => {
      const title = route.snapshot.data['title'];
      this.updateTitle(title);
    });
  }

  /**
   * Recursively retrieves the deepest child route of the given route.
   * This is used to find the most specific route for the current navigation.
   *
   * @param route - The current activated route.
   * @returns The deepest child route.
   */
  private getDeepestChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  /**
   * Updates the title of the toolbar.
   * This method can be called from any component to set a new title.
   *
   * @param newTitle - The new title to set.
   */
  updateTitle(newTitle: string): void {
    this.titleSource.next(newTitle);
  }
}
