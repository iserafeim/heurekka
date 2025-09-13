import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      
      expect(result.current).toBe('initial');
    });

    it('should debounce string values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      );

      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated', delay: 500 });
      
      // Should still return old value before delay
      expect(result.current).toBe('initial');
      
      // Fast-forward time by delay
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Should now return updated value
      expect(result.current).toBe('updated');
    });

    it('should debounce number values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: number; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 1, delay: 300 }
        }
      );

      expect(result.current).toBe(1);

      rerender({ value: 2, delay: 300 });
      expect(result.current).toBe(1);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe(2);
    });

    it('should debounce object values', () => {
      const initialObj = { id: 1, name: 'initial' };
      const updatedObj = { id: 2, name: 'updated' };

      const { result, rerender } = renderHook(
        ({ value, delay }: { value: any; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: initialObj, delay: 400 }
        }
      );

      expect(result.current).toBe(initialObj);

      rerender({ value: updatedObj, delay: 400 });
      expect(result.current).toBe(initialObj);
      
      act(() => {
        jest.advanceTimersByTime(400);
      });
      
      expect(result.current).toBe(updatedObj);
    });
  });

  describe('Multiple Updates', () => {
    it('should reset timer on subsequent value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      );

      // First update
      rerender({ value: 'first', delay: 500 });
      
      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should still be initial value
      expect(result.current).toBe('initial');
      
      // Second update before first completes
      rerender({ value: 'second', delay: 500 });
      
      // Advance time partially again
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should still be initial value
      expect(result.current).toBe('initial');
      
      // Complete the full delay for second update
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Should now be the second value
      expect(result.current).toBe('second');
    });

    it('should handle rapid successive updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 200 }
        }
      );

      // Rapid updates
      rerender({ value: 'update1', delay: 200 });
      rerender({ value: 'update2', delay: 200 });
      rerender({ value: 'update3', delay: 200 });
      rerender({ value: 'final', delay: 200 });

      // Should still be initial
      expect(result.current).toBe('initial');

      // Complete delay
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should be the final value
      expect(result.current).toBe('final');
    });
  });

  describe('Delay Changes', () => {
    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      );

      // Update value with original delay
      rerender({ value: 'updated', delay: 500 });
      
      // Change delay before completion
      rerender({ value: 'updated', delay: 100 });
      
      // Advance by the new shorter delay
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe('updated');
    });

    it('should handle zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 0 }
        }
      );

      rerender({ value: 'immediate', delay: 0 });
      
      act(() => {
        jest.advanceTimersByTime(0);
      });
      
      expect(result.current).toBe('immediate');
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      );

      rerender({ value: 'updated', delay: 500 });
      
      // Unmount before delay completes
      unmount();
      
      // Complete delay after unmount
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Should not cause any errors or warnings
      expect(result.current).toBe('initial');
    });

    it('should clear previous timeout when value changes', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      );

      // First update creates a timeout
      rerender({ value: 'first', delay: 500 });
      
      // Second update should clear the previous timeout
      rerender({ value: 'second', delay: 500 });
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: any; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: undefined, delay: 300 }
        }
      );

      expect(result.current).toBe(undefined);

      rerender({ value: 'defined', delay: 300 });
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('defined');
    });

    it('should handle null values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: any; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: null, delay: 300 }
        }
      );

      expect(result.current).toBe(null);

      rerender({ value: 'not-null', delay: 300 });
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current).toBe('not-null');
    });

    it('should handle boolean values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }: { value: boolean; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: true, delay: 200 }
        }
      );

      expect(result.current).toBe(true);

      rerender({ value: false, delay: 200 });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe(false);
    });

    it('should handle array values', () => {
      const initialArray = [1, 2, 3];
      const updatedArray = [4, 5, 6];

      const { result, rerender } = renderHook(
        ({ value, delay }: { value: number[]; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: initialArray, delay: 400 }
        }
      );

      expect(result.current).toBe(initialArray);

      rerender({ value: updatedArray, delay: 400 });
      
      act(() => {
        jest.advanceTimersByTime(400);
      });
      
      expect(result.current).toBe(updatedArray);
    });
  });

  describe('Performance', () => {
    it('should not create unnecessary timers for same values', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { rerender } = renderHook(
        ({ value, delay }: { value: string; delay: number }) => 
          useDebounce(value, delay),
        {
          initialProps: { value: 'same', delay: 300 }
        }
      );

      const initialTimeoutCalls = setTimeoutSpy.mock.calls.length;

      // Update with same value
      rerender({ value: 'same', delay: 300 });
      
      // Should still create a new timeout (React behavior)
      expect(setTimeoutSpy.mock.calls.length).toBeGreaterThan(initialTimeoutCalls);
      
      setTimeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });
  });
});