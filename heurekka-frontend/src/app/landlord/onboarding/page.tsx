/**
 * Onboarding Root Page
 * Redirige a /welcome
 */

import { redirect } from 'next/navigation';

export default function OnboardingPage() {
  redirect('/landlord/onboarding/welcome');
}
