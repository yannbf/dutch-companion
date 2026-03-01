import { test, expect } from '@playwright/test'

test.describe('Dutch Companion core flows', () => {
  test('redirects root to exercises and lists core exercise cards', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/exercises$/)
    await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()

    await expect(page.getByText('Verb tenses')).toBeVisible()
    await expect(page.getByText('Vocabulary Flashcards')).toBeVisible()
    await expect(page.getByText('Vocabulary Match')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Separable Verbs' })).toBeVisible()
    await expect(page.getByText('Wheel of Fortune')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pronunciation' })).toBeVisible()
  })

  test('supports navigation through bottom nav', async ({ page }) => {
    await page.goto('/exercises')

    await page.getByRole('link', { name: 'Vocabulary' }).click()
    await expect(page).toHaveURL(/\/vocabulary$/)

    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings$/)

    await page.getByRole('link', { name: 'Exercises' }).click()
    await expect(page).toHaveURL(/\/exercises$/)
  })

  test('starts verb exercise from setup and lands on play screen', async ({ page }) => {
    await page.goto('/exercises/verbs')

    await expect(page.getByText('Verb tenses')).toBeVisible()
    await page.getByRole('button', { name: /Start Practice/i }).click()

    await expect(page).toHaveURL(/\/exercises\/verbs\/play$/)
    await expect(page.getByText('Tap to flip • Swipe to score')).toBeVisible()
    await expect(page.getByText(/Score:/)).toBeVisible()
  })

  test('vocabulary match requires chapter/favorites before start', async ({ page }) => {
    await page.goto('/exercises/vocabulary-match')

    const startButton = page.getByRole('button', { name: 'Start Matching' })
    await expect(startButton).toBeDisabled()

    // Toggle favorites to enable start
    await page.getByText('♥ Favorites').click()
    await expect(startButton).toBeEnabled()

    await startButton.click()
    await expect(page).toHaveURL(/\/exercises\/vocabulary-match\/play$/)
  })

  test('settings toggles persist across page reload', async ({ page }) => {
    await page.goto('/settings')

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
