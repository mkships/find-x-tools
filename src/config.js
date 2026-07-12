// Site-wide settings.

export const SITE_NAME = 'X Tools Directory';

// Launch mode: free submissions only — the wizard hides the paid "Listing plan"
// step and every submission is recorded as plan "free".
// Flip to true to enable the designed paid plans (Featured $49 / Premium $99/mo)
// once traffic justifies it. No other change needed.
export const PAID_SUBMISSIONS = false;

export const PLANS = [
  { id: 'free', name: 'Free listing', price: '$0', desc: 'Standard placement in the directory. Reviewed within ~5 days.' },
  { id: 'featured', name: 'Featured', price: '$49', desc: '★ Featured badge and top-of-category placement for 30 days.' },
  { id: 'premium', name: 'Premium spotlight', price: '$99/mo', desc: 'Homepage sponsored slot, featured badge and a newsletter mention.' }
];
