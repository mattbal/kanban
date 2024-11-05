import { test, expect } from '@playwright/test';

test('add board adds new board', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();
  await expect(page.getByRole('link', { name: 'New Board' })).toBeVisible();
});

test('Double clicking a board link lets you edit it', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();
  await page.getByRole('link', { name: 'New Board' }).dblclick();
  await page.getByRole('complementary').getByRole('textbox').fill('Test Project');
  await page.getByRole('complementary').getByRole('textbox').press('Enter');
  await expect(page.getByRole('link', { name: 'Test Project' })).toBeVisible();
});

test('Editing board title updates board title', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByPlaceholder('New Board').fill('Board');
  await expect(page.getByPlaceholder('New Board')).toHaveValue('Board');
});

test("Clicking dropdown menu's delete button delets board", async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByTestId('dropdownButton').click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('link', { name: 'New Board' })).not.toBeAttached();
});

test("Edit and Delete buttons work in board link's context menu", async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByRole('link', { name: 'New Board' }).click({
    button: 'right',
  });
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('complementary').getByRole('textbox').fill('Test');
  await page.getByRole('complementary').getByRole('textbox').press('Enter');
  expect(page.getByRole('link', { name: 'Test' })).toBeVisible();
  await page.getByRole('link', { name: 'Test' }).click({
    button: 'right',
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('link', { name: 'Test' })).not.toBeAttached();
});

test('Adding a list adds a list', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByRole('button', { name: 'Add a list' }).click();
  await page.getByPlaceholder('Enter list title...').fill('Grocery List');
  await page.getByRole('button', { name: 'Add list' }).click();
  const input = page.getByPlaceholder('List');
  await expect(input).toBeVisible();
  await expect(input).toHaveValue('Grocery List');
});

test('Adding an item adds an item', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByRole('button', { name: 'Add a list' }).click();
  await page.getByPlaceholder('Enter list title...').fill('Costco List');
  await page.getByRole('button', { name: 'Add list' }).click();

  await page.getByTestId('list').getByRole('button', { name: 'Add Item' }).click();
  await page.getByPlaceholder('Enter an item...').fill('Buy bananas');
  await page.getByTestId('list').getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByText('Buy bananas')).toBeVisible();
});

test('Right clicking an item lets you edit and delete', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByRole('button', { name: 'Add a list' }).click();
  await page.getByPlaceholder('Enter list title...').fill('Costco List');
  await page.getByRole('button', { name: 'Add list' }).click();

  await page.getByTestId('list').getByRole('button', { name: 'Add Item' }).click();
  await page.getByPlaceholder('Enter an item...').fill('Buy bananas');
  await page.getByTestId('list').getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByText('Buy bananas')).toBeVisible();

  await page.getByTestId('item').click({
    button: 'right',
  });
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByTestId('item').getByRole('textbox').fill('Buy grapes');
  await page.getByTestId('item').getByRole('textbox').press('Enter');
  await page.getByTestId('item').click({
    button: 'right',
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Buy bananas')).not.toBeAttached();
});

test('Clicking list dropdown menu lets you delete', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Board' }).click();

  await page.getByRole('button', { name: 'Add a list' }).click();
  await page.getByPlaceholder('Enter list title...').fill('Costco List');
  await page.getByRole('button', { name: 'Add list' }).click();

  await page.getByTestId('list').getByRole('button', { name: 'Add Item' }).click();
  await page.getByPlaceholder('Enter an item...').fill('Buy bananas');
  await page.getByTestId('list').getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByText('Buy bananas')).toBeVisible();

  await page.getByTestId('list').getByTestId('dropdownButton').click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Buy bananas')).not.toBeAttached();
  await expect(page.getByPlaceholder('List')).not.toBeAttached();
});
