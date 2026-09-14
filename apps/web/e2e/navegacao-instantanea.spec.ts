import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test.describe('navegação instantânea', () => {
  test('troca de episódio sem esperar a rede', async ({ page }) => {
    await page.goto('/episode/10');
    await expect(page.getByTestId('cast-grid').first()).toBeVisible();

    await instant(page, async () => {
      await page.getByTestId('nav-next').first().click();
      await expect(page).toHaveURL(/\/episode\/11$/u);
    });

    await expect(page.getByTestId('cast-grid').first()).toBeVisible();
  });

  test('volta ao episódio anterior instantaneamente', async ({ page }) => {
    await page.goto('/episode/10');
    await expect(page.getByTestId('cast-grid').first()).toBeVisible();

    await instant(page, async () => {
      await page.getByTestId('nav-previous').first().click();
      await expect(page).toHaveURL(/\/episode\/9$/u);
    });
  });

  test('percorre vários episódios em sequência mantendo a resposta imediata', async ({ page }) => {
    await page.goto('/episode/20');
    await expect(page.getByTestId('cast-grid').first()).toBeVisible();

    for (const destino of [21, 22, 23]) {
      await instant(page, async () => {
        await page.getByTestId('nav-next').first().click();
        await expect(page).toHaveURL(new RegExp(`/episode/${destino}$`, 'u'));
      });
    }
  });
});
