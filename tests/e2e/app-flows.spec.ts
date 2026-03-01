import { test, expect, type Page } from '@playwright/test'

const gotoE2E = async (page: Page, path: string) => {
  const url = path.includes('?') ? `${path}&e2e=1&seed=42` : `${path}?e2e=1&seed=42`
  await page.goto(url)
}

test.describe('Dutch Companion core flows', () => {
  test('redirects root to exercises and lists core exercise cards', async ({ page }) => {
    await gotoE2E(page, '/')

    await expect(page).toHaveURL(/\/exercises/)
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Verb tenses' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Vocabulary Flashcards' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Vocabulary Match' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Separable Verbs' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Wheel of Fortune' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pronunciation' })).toBeVisible()
  })

  test('supports navigation through bottom nav', async ({ page }) => {
    await gotoE2E(page, '/exercises')

    await page.getByRole('link', { name: 'Vocabulary' }).click()
    await expect(page).toHaveURL(/\/vocabulary/)

    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings/)

    await page.getByRole('link', { name: 'Exercises' }).click()
    await expect(page).toHaveURL(/\/exercises/)
  })

  test('verbs setup starts play flow', async ({ page }) => {
    await gotoE2E(page, '/exercises/verbs')

    await expect(page.getByText('Verb tenses')).toBeVisible()
    await page.getByRole('button', { name: /Start Practice/i }).click()

    await expect(page).toHaveURL(/\/exercises\/verbs\/play/)
    await expect(page.getByText('Tap to flip • Swipe to score')).toBeVisible()
    await expect(page.getByText(/Score:/)).toBeVisible()
  })

  test('vocabulary flashcards route renders setup and start control', async ({ page }) => {
    await gotoE2E(page, '/exercises/vocabulary')

    await expect(page.getByRole('heading', { name: 'Vocabulary Flashcards' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Select Chapters' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible()
  })

  test('vocabulary match requires chapter/favorites before start', async ({ page }) => {
    await gotoE2E(page, '/exercises/vocabulary-match')

    const startButton = page.getByRole('button', { name: 'Start Matching' })
    await expect(startButton).toBeDisabled()

    await page.getByText('♥ Favorites').click()
    await expect(startButton).toBeEnabled()

    await startButton.click()
    await expect(page).toHaveURL(/\/exercises\/vocabulary-match\/play/)
  })

  test('de/het setup and play routes work', async ({ page }) => {
    await gotoE2E(page, '/exercises/deofhet')
    await expect(page.getByText('De of Het')).toBeVisible()

    await page.getByRole('button', { name: 'Start Exercise' }).click()
    await expect(page).toHaveURL(/\/exercises\/deofhet\/play/)
  })

  test('separable verbs setup and play routes work', async ({ page }) => {
    await gotoE2E(page, '/exercises/separable-verbs')

    await expect(page.getByText('Sentence Builder')).toBeVisible()
    await page.getByRole('button', { name: /Start Practice/i }).click()

    await expect(page).toHaveURL(/\/exercises\/separable-verbs\/play/)
  })

  test('sentence generator route renders', async ({ page }) => {
    await gotoE2E(page, '/exercises/sentence-generator')

    await expect(page.getByRole('heading', { name: 'Sentence Generator' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pronomen opnieuw' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Genereer alles' })).toBeVisible()
  })

  test('pronunciation route renders search form', async ({ page }) => {
    await gotoE2E(page, '/exercises/pronunciation')

    await expect(page.getByText('Pronunciation Practice')).toBeVisible()
    await expect(page.getByPlaceholder(/Type a Dutch word/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Search/i })).toBeVisible()
  })

  test('settings toggles persist across page reload', async ({ page }) => {
    await gotoE2E(page, '/settings')

    const translationToggle = page.locator('#translation-toggle')
    const randomToggle = page.locator('#random-toggle')

    const translationBefore = await translationToggle.getAttribute('aria-checked')
    const randomBefore = await randomToggle.getAttribute('aria-checked')

    await translationToggle.click()
    await randomToggle.click()

    const translationAfter = await translationToggle.getAttribute('aria-checked')
    const randomAfter = await randomToggle.getAttribute('aria-checked')

    expect(translationAfter).not.toBe(translationBefore)
    expect(randomAfter).not.toBe(randomBefore)

    await page.reload()

    await expect(page.locator('#translation-toggle')).toHaveAttribute(
      'aria-checked',
      translationAfter || 'false',
    )
    await expect(page.locator('#random-toggle')).toHaveAttribute(
      'aria-checked',
      randomAfter || 'false',
    )
  })
})
