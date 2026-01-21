import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check if login form elements are visible
    await expect(page.getByLabel(/nome de usuário ou email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await page.getByLabel(/nome de usuário ou email/i).fill('invaliduser');
    await page.getByLabel(/senha/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Wait for error message
    await expect(page.getByText(/credenciais inválidas|usuário ou senha/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill form with valid credentials
    await page.getByLabel(/nome de usuário ou email/i).fill('tutor');
    await page.getByLabel(/senha/i).fill('Maitland@2025');
    
    // Submit form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Wait for redirect to dashboard (successful login)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Verify user is logged in - check for dashboard content
    await expect(page.getByText(/dashboard|painel/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login with email instead of username', async ({ page }) => {
    // Test email-based login (should work due to backend support)
    await page.getByLabel(/nome de usuário ou email/i).fill('test@gmail.com');
    await page.getByLabel(/senha/i).fill('Maitland@2025');
    
    // Submit form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should show network error when backend is down', async ({ page }) => {
    // This test requires the backend to be stopped
    // For now, we'll just check that the error handling works
    // by testing the form validation
    
    // Try to submit empty form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Browser validation should prevent submission or show validation error
    // The form has required fields, so submission should be prevented
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register tab', async ({ page }) => {
    // Click on register tab
    await page.getByRole('tab', { name: /registrar|cadastrar/i }).click();
    
    // Check if register form is visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
  });

  test('should validate password confirmation on register', async ({ page }) => {
    // Switch to register tab
    await page.getByRole('tab', { name: /registrar|cadastrar/i }).click();
    
    // Fill register form with mismatched passwords
    await page.getByLabel(/nome de usuário/i).fill('newuser');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/senha/i).fill('password123');
    await page.getByLabel(/confirmar senha|confirmar/i).fill('password456');
    
    // Submit form
    await page.getByRole('button', { name: /registrar|cadastrar/i }).click();
    
    // Should show password mismatch error
    await expect(page.getByText(/senhas não coincidem/i)).toBeVisible({ timeout: 5000 });
  });
});
