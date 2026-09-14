import { expect, test } from '@playwright/test';

test.describe('exploração do elenco', () => {
  test('filtra personagens por nome sem nova requisição', async ({ page }) => {
    await page.goto('/episode/28');

    await expect(page.getByTestId('cast-count')).toHaveText('65 personagens');

    await page.getByLabel(/filtrar elenco/iu).fill('morty');

    await expect(page.getByTestId('cast-count')).toContainText('de 65');
    const filtrados = await page.getByTestId('character-card').count();
    expect(filtrados).toBeGreaterThan(0);
    expect(filtrados).toBeLessThan(65);
  });

  test('informa quando o filtro não encontra ninguém', async ({ page }) => {
    await page.goto('/episode/1');

    await page.getByLabel(/filtrar elenco/iu).fill('zzzzzz');

    await expect(page.getByText(/nenhum personagem corresponde/iu)).toBeVisible();
  });

  test('abre o detalhe do personagem com suas aparições', async ({ page }) => {
    await page.goto('/episode/1');

    await page.getByTestId('character-card').first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Espécie')).toBeVisible();
    await expect(dialog.getByTestId('appearance').first()).toBeVisible();
  });

  test('fecha o detalhe com Escape', async ({ page }) => {
    await page.goto('/episode/1');

    await page.getByTestId('character-card').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('permite navegar todo o fluxo pelo teclado', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/número do episódio/iu).fill('2');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/episode\/2$/u);
  });
});
