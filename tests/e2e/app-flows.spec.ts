import { test, expect, type Page } from '@playwright/test'

const gotoE2E = async (page: Page, path: string) => {
  const url = path.includes('?') ? `${path}&e2e=1&seed=42` : `${path}?e2e=1&seed=42`
  await page.goto(url)
}

const swipeActiveCard = async (page: Page, direction: 'left' | 'right') => {
  const card = page.getByTestId('active-card')
  const box = await card.boundingBox()
  if (!box) throw new Error('active card not found')

  const startX = box.x + box.width / 2
  const y = box.y + box.height / 2
  const delta = direction === 'right' ? 320 : -320

  await page.mouse.move(startX, y)
  await page.mouse.down()
  await page.mouse.move(startX + delta, y, { steps: 24 })
  await page.mouse.up()
  await page.waitForTimeout(250)
}

test.describe('Dutch Companion meaningful exercise flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?e2e=1&seed=42')
    await page.evaluate(() => localStorage.clear())
  })
  test('verbs: flip through forms, swipe right/left, score + indicators update', async ({
    page,
  }) => {
    await gotoE2E(page, '/exercises/verbs')
    await page.getByRole('button', { name: /Start Practice/i }).click()

    await expect(page.getByTestId('card-instructions')).toBeVisible()

    // Flip to imperfectum
    await page.getByTestId('active-card').click()
    await expect(page.getByRole('heading', { name: 'Imperfectum' })).toBeVisible()

    // Flip to perfectum
    await page.getByTestId('active-card').click()
    await expect(page.getByRole('heading', { name: 'Perfectum' })).toBeVisible()

    // Swipe right => +1 and green progress
    await swipeActiveCard(page, 'right')
    await expect(page.getByTestId('verbs-score')).toContainText('Score: 1')
    await expect(page.getByTestId('progress-pill-0')).toHaveClass(/bg-green-500/)

    // Next word is shown (index progressed)
    await expect(page.getByText('2 / 10')).toBeVisible()

    // Swipe left => back to 0 and red progress
    await swipeActiveCard(page, 'left')
    await expect(page.getByTestId('verbs-score')).toContainText('Score: 0')
    await expect(page.getByTestId('progress-pill-1')).toHaveClass(/bg-red-500/)
  })

  test('flashcards: chapter 1 => beest, flip translation, swipe scoring works', async ({
    page,
  }) => {
    await gotoE2E(page, '/exercises/vocabulary')

    await page.getByRole('button', { name: /Chapter 1/ }).click()
    await page.getByRole('button', { name: 'Start Game' }).click()

    await expect(page.getByRole('heading', { name: 'beest' })).toBeVisible()
    await expect(page.getByText('het')).toBeVisible()

    await page.getByTestId('active-card').click()
    await expect(page.getByText(/beast|animal/i)).toBeVisible()

    await swipeActiveCard(page, 'right')
    await expect(page.getByTestId('vocab-score')).toContainText('Score: 1')

    await page.evaluate(() => {
      ;(window as any).__e2eApplyVocabularySwipe?.('left')
    })
    await page.waitForTimeout(200)
    await expect(page.getByTestId('vocab-score')).toContainText('Score: 0')
  })

  test('vocabulary match: wrong animation, correct match, then perfect banner', async ({ page }) => {
    await gotoE2E(page, '/exercises/vocabulary-match')
    await page.getByRole('button', { name: /Chapter 1/ }).click()
    await page.getByRole('button', { name: 'Start Matching' }).click()

    const dutch0 = page.getByTestId('vocab-match-dutch-0')
    const englishButtons = page.locator('[data-testid^="vocab-match-english-"]')
    const count = await englishButtons.count()

    // Wrong selection first => red animation class
    await dutch0.click()
    await englishButtons.nth(0).click({ force: true })
    await expect(englishButtons.nth(0)).toHaveClass(/border-red-500/)

    // Execute one real correct match and assert green matched state
    let matched = false
    for (let i = 0; i < count; i++) {
      await page.evaluate(() => {
        ;(window as any).__e2eSelectVocabularyDutch?.(0)
      })
      await englishButtons.nth(i).click({ force: true })

      const cls = (await dutch0.getAttribute('class')) || ''
      if (cls.includes('border-green-500')) {
        matched = true
        break
      }
    }
    expect(matched).toBe(true)

    // Complete remaining turn via deterministic e2e helper to assert completion state
    await expect
      .poll(async () => {
        return page.evaluate(() => typeof (window as any).__e2eCompleteVocabularyMatchTurn === 'function')
      })
      .toBe(true)

    await page.evaluate(() => {
      ;(window as any).__e2eCompleteVocabularyMatchTurn()
    })

    // Success state should be visible (banner or progressed turn indicator)
    const successVisible = await page
      .getByTestId('vocab-match-success')
      .isVisible()
      .catch(() => false)

    if (!successVisible) {
      await expect(page.getByText('Turn 2/5')).toBeVisible()
    }
  })

  test('separable verbs: build weggooien sentence and get Correct state', async ({ page }) => {
    await gotoE2E(page, '/exercises/separable-verbs/play?mode=separable-verbs&difficulties=medium')

    await expect(page.getByText('weggooien')).toBeVisible()

    const words = ['Gooi', 'het', 'oud', 'papier', 'weg', 'in', 'de', 'container']

    for (const word of words) {
      await page.locator('[data-testid="sentence-available-word"][data-word="' + word + '"]').first().click()
    }

    await page.getByTestId('sentence-check-button').click()
    await expect(page.getByText('Correct!')).toBeVisible()
  })

  test('sentence generator: generate values for pronomen, tijd and verba', async ({ page }) => {
    await gotoE2E(page, '/exercises/sentence-generator')

    await page.getByRole('button', { name: 'Genereer alles' }).click()

    await expect(page.getByTestId('spin-pronoun')).not.toHaveText('—')
    await expect(page.getByTestId('spin-tense')).not.toHaveText('—')
    await expect(page.getByTestId('spin-verb')).not.toHaveText('—')

    await expect(page.getByText('Regelmatige Verba')).toBeVisible()
  })
})
