import { Locator, Page } from '@playwright/test';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export class LoginPage {
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly signInButton: Locator;
  readonly programsButton: Locator;

  constructor(readonly page: Page) {
    this.emailField = page.getByLabel('Email');
    this.passwordField = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.programsButton = page.getByRole('button', { name: 'Programs' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.signInButton.click();
  }

  async signInAsAdmin(): Promise<void> {
    await this.signIn(requireEnv('DIDAXIS_EMAIL'), requireEnv('DIDAXIS_PASSWORD'));
  }

  async openPrograms(): Promise<void> {
    await this.programsButton.click();
  }
}
