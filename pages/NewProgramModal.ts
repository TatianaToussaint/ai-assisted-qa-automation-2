import { Locator, Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programNameField: Locator;
  readonly descriptionField: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programNameField = this.dialog.getByLabel('Program Name');
    this.descriptionField = this.dialog.getByLabel('Description');
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
  }

  async fillProgramName(name: string): Promise<void> {
    await this.programNameField.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionField.fill(description);
  }

  async clearProgramName(): Promise<void> {
    await this.programNameField.clear();
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async doubleClickCreate(): Promise<void> {
    await this.createButton.dblclick();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickClose(): Promise<void> {
    await this.closeButton.click();
  }
}
