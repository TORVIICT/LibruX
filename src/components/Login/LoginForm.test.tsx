import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { login } from '../../services/auth.service';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../services/auth.service', () => ({
  login: vi.fn(),
}));

describe('LoginForm', () => {
  const defaultProps = {
    view: 'login',
    toggleView: vi.fn(),
    saveToken: vi.fn(),
    getAuthErrorMessage: vi.fn((msg: string) => `Handled: ${msg}`),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form elements properly', () => {
    render(<LoginForm {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'LOGIN' })).toBeInTheDocument();
  });

  it('should show validation errors when submitted empty', async () => {
    render(<LoginForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'LOGIN' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), '123');
    await user.click(screen.getByRole('button', { name: 'LOGIN' }));

    expect(await screen.findByText('Password must be at least 6 characters long.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('should successfully submit form, save token, and navigate to dashboard', async () => {
    const user = userEvent.setup();
    const mockAuthData = {
      session: {
        access_token: 'mock-jwt-token-123',
      },
      user: {
        email: 'user@example.com',
        user_metadata: {
          name: 'Jane Doe',
        },
      },
    };

    vi.mocked(login).mockResolvedValueOnce({
      data: mockAuthData,
      error: null,
    } as any);

    render(<LoginForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'LOGIN' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('user@example.com', 'secret123');
    });

    expect(defaultProps.saveToken).toHaveBeenCalledWith('mock-jwt-token-123');
    expect(localStorage.getItem('user-name')).toBe('Jane Doe');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByText('Login saved successfully!')).toBeInTheDocument();
  });

  it('should display error message when login fails', async () => {
    const user = userEvent.setup();
    vi.mocked(login).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid credentials' },
    } as any);

    render(<LoginForm {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('Email'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'LOGIN' }));

    await waitFor(() => {
      expect(screen.getByText('Handled: Invalid credentials')).toBeInTheDocument();
    });

    expect(defaultProps.saveToken).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should trigger toggleView when clicking register link', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);

    const registerLink = screen.getByText(/Register here/i);
    await user.click(registerLink);

    expect(defaultProps.toggleView).toHaveBeenCalledTimes(1);
  });
});
