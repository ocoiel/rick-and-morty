import { expect, test } from '@playwright/test';

test.describe('busca de episódio', () => {
  test('leva o usuário da home ao elenco do episódio', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/número do episódio/iu).fill('1');
    await page.getByRole('button', { name: /ver elenco/iu }).click();

    await expect(page).toHaveURL(/\/episode\/1$/u);
    await expect(page.getByRole('heading', { name: 'Pilot' })).toBeVisible();
  });

  test('lista o elenco em ordem alfabética', async ({ page }) => {
    await page.goto('/episode/1');

    const nomes = await page.getByTestId('character-card').locator('h3').allTextContents();

    expect(nomes.length).toBeGreaterThan(0);
    expect(nomes).toEqual(nomes.toSorted((a, b) => a.localeCompare(b, 'pt-BR')));
  });

  test('renderiza o elenco completo do episódio mais populoso', async ({ page }) => {
    await page.goto('/episode/28');

    await expect(page.getByRole('heading', { name: 'The Ricklantis Mixup' })).toBeVisible();
    await expect(page.getByTestId('cast-count')).toHaveText('65 personagens');
  });

  test('impede envio de episódio fora do catálogo', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/número do episódio/iu).fill('999');
    await page.getByRole('button', { name: /ver elenco/iu }).click();

    await expect(page.getByTestId('search-error')).toContainText('entre 1 e 51');
    await expect(page).toHaveURL('/');
  });

  test('responde 404 para episódio inexistente acessado diretamente', async ({ page }) => {
    const response = await page.goto('/episode/999');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /não existe/iu })).toBeVisible();
  });
});
