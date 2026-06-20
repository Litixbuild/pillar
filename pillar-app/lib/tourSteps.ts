export type TourAdvanceMode = 'click' | 'next' | 'finish';

export interface TourStep {
  id: string;
  /** Exact pathname this step lives on. */
  path: string;
  /** If true, matches any pathname starting with `path` (for dynamic routes like /manager/activity/[slug]). */
  pathIsPrefix?: boolean;
  /** CSS selector for the element to spotlight. */
  selector: string;
  title: string;
  body: string;
  placement: 'top' | 'bottom' | 'center';
  advance: TourAdvanceMode;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    path: '/manager',
    selector: '[data-tour="dashboard-saved-calls"]',
    title: 'Your command center',
    body: "This is your dashboard — a real-time pulse on every property you manage. We've set up a sample property so you can see it all in action. Let's take a quick look around.",
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'dashboard-resolution',
    path: '/manager',
    selector: '[data-tour="dashboard-resolution"]',
    title: 'Average resolution time',
    body: 'This tracks how quickly you close out tenant work orders, with a trend against last month.',
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'dashboard-health',
    path: '/manager',
    selector: '[data-tour="dashboard-health"]',
    title: 'Property health',
    body: 'Each property gets a color-coded dot — green means all clear, amber or red means something needs your attention. Your tutorial example is amber since it has one open item.',
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'goto-properties',
    path: '/manager',
    selector: '[data-tour="nav-properties"]',
    title: 'Your properties',
    body: 'Tap Properties to see what a finished property guide looks like to your tenants.',
    placement: 'top',
    advance: 'click',
  },
  {
    id: 'properties-card',
    path: '/manager/properties',
    selector: '[data-tour="demo-property-card"]',
    title: 'A finished example',
    body: 'We set up a sample property — "123 Demo Lane" — so you can see exactly what a complete guide looks like before you build your own.',
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'properties-live',
    path: '/manager/properties',
    selector: '[data-tour="demo-live"]',
    title: 'The live guest view',
    body: 'Live opens the exact page your tenants see — WiFi, amenities, and house rules, all in one elegant guide.',
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'properties-edit',
    path: '/manager/properties',
    selector: '[data-tour="demo-edit"]',
    title: 'Editing a property',
    body: "Edit is where you'll set up WiFi, photos, amenities, and work order categories for your own properties.",
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'properties-add',
    path: '/manager/properties',
    selector: '[data-tour="add-property-locked"]',
    title: 'Adding your own property',
    body: "Once you subscribe, this button creates your first real property. We'll get you there at the end of this tour.",
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'goto-activity',
    path: '/manager/properties',
    selector: '[data-tour="nav-activity"]',
    title: 'Tenant requests',
    body: 'Next, tap Activity to see how work orders and late checkout requests come in from tenants.',
    placement: 'top',
    advance: 'click',
  },
  {
    id: 'activity-tile',
    path: '/manager/activity',
    selector: '[data-tour="demo-activity-tile"]',
    title: 'Open items',
    body: 'Tap your demo property to see a live example of an open request.',
    placement: 'center',
    advance: 'click',
  },
  {
    id: 'activity-open-orders',
    path: '/manager/activity/',
    pathIsPrefix: true,
    selector: '[data-tour="activity-open-orders"]',
    title: 'Work orders',
    body: "Tenants submit issues like this one — a leaking sink — right from their phone. Mark it resolved once it's handled.",
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'activity-late-checkout',
    path: '/manager/activity/',
    pathIsPrefix: true,
    selector: '[data-tour="activity-late-checkout"]',
    title: 'Late checkout requests',
    body: 'Approve or deny requests like this one in one tap — your tenant sees the decision instantly.',
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'goto-billing',
    path: '/manager/activity/',
    pathIsPrefix: true,
    selector: '[data-tour="nav-billing"]',
    title: 'Last stop: billing',
    body: 'Almost done — tap Billing to see how to activate your account.',
    placement: 'top',
    advance: 'click',
  },
  {
    id: 'billing-subscribe',
    path: '/manager/billing',
    selector: '[data-tour="billing-subscribe"]',
    title: "You're ready",
    body: "Subscribing unlocks your first property slot. The moment you do, we'll clear out this tutorial example so you can build your real guide.",
    placement: 'bottom',
    advance: 'finish',
  },
];

export function stepMatchesPath(step: TourStep, pathname: string): boolean {
  return step.pathIsPrefix ? pathname.startsWith(step.path) : pathname === step.path;
}
