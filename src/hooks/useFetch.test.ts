import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should return initial loading state', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useFetch('https://api.example.com/books'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch data successfully and update state', async () => {
    const mockData = { docs: [{ id: 1, title: 'Clean Code' }] };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useFetch('https://api.example.com/books'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/books');
  });

  it('should handle fetch errors and update error state', async () => {
    const mockError = new Error('Network failure');

    global.fetch = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetch('https://api.example.com/error'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should re-fetch data when url changes', async () => {
    const firstData = { result: 'first' };
    const secondData = { result: 'second' };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => firstData,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => secondData,
      } as Response);

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: 'https://api.example.com/first' } }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(firstData);
    });

    rerender({ url: 'https://api.example.com/second' });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondData);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://api.example.com/first');
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://api.example.com/second');
  });
});
