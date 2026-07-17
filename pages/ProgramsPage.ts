import { Locator, Page } from '@playwright/test';
import { EditProgramModal } from './EditProgramModal';
import { NewProgramModal } from './NewProgramModal';

export class ProgramsPage {
  readonly newProgramModal: NewProgramModal;
  readonly editProgramModal: EditProgramModal;
  readonly newProgramButton: Locator;
  readonly heading: Locator;
  readonly tagline: Locator;
  readonly programsNavButton: Locator;

  constructor(readonly page: Page) {
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.tagline = page.getByText('Manage academic programs and semesters');
    this.programsNavButton = page.getByRole('button', { name: 'Programs' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs', { waitUntil: 'domcontentloaded' });
  }

  async navigateViaSidebar(): Promise<void> {
    await this.programsNavButton.click();
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  async createProgram(name: string, description: string): Promise<void> {
    await this.openNewProgramForm();
    await this.newProgramModal.fillProgramName(name);
    if (description) {
      await this.newProgramModal.fillDescription(description);
    }
    await this.newProgramModal.clickCreate();
  }

  editProgramButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  deleteProgramButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${programName}` });
  }

  async openEditFormForProgram(programName: string): Promise<void> {
    await this.editProgramButton(programName).click();
  }

  async deleteProgram(programName: string): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.deleteProgramButton(programName).click();
  }

  async cancelDeleteProgram(programName: string): Promise<string> {
    let message = '';
    this.page.once('dialog', (dialog) => {
      message = dialog.message();
      void dialog.dismiss();
    });
    await this.deleteProgramButton(programName).click();
    return message;
  }

  programRow(programName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByText(programName, { exact: true }),
    });
  }

  visibleText(text: string): Locator {
    return this.page.getByText(text);
  }

  async countProgramsNamed(programName: string): Promise<number> {
    return this.programRow(programName).count();
  }

  async getProgramDescriptionInList(programName: string): Promise<string> {
    const row = this.programRow(programName);
    const paragraphs = row.locator('p');
    if ((await paragraphs.count()) < 2) {
      return '';
    }
    return (await paragraphs.nth(1).textContent())?.trim() ?? '';
  }
}
