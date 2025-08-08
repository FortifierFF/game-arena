/**
 * Global 404 Not Found Page
 * Redirects to the locale 404 page
 */

import { redirect } from 'next/navigation';

export default function GlobalNotFound() {
  // Redirect to the English locale 404 page
  redirect('/en/404');
} 