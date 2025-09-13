import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useIntersectionObserver } from '../useIntersectionObserver';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

const MockIntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
  // Store callback for testing
  callback
}));

// Store the original IntersectionObserver
const originalIntersectionObserver = global.IntersectionObserver;

beforeAll(() => {
  global.IntersectionObserver = MockIntersectionObserver;
});

afterAll(() => {
  global.IntersectionObserver = originalIntersectionObserver;
});

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useIntersectionObserver(ref);
      });

      expect(result.current.isIntersecting).toBe(false);
      expect(result.current.entry).toBe(null);
    });

    it('should not create observer when element is null', () => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        return useIntersectionObserver(ref);
      });

      expect(MockIntersectionObserver).not.toHaveBeenCalled();
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('should create observer when element exists', () => {
      const mockElement = document.createElement('div');

      renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref);
      });

      expect(MockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0,
          root: null,
          rootMargin: '0px'
        }
      );
      expect(mockObserve).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('Intersection Detection', () => {
    it('should update state when intersection changes', () => {
      const mockElement = document.createElement('div');
      let observerCallback: (entries: IntersectionObserverEntry[]) => void;

      MockIntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect
        };
      });

      const { result } = renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref);
      });

      expect(result.current.isIntersecting).toBe(false);

      // Simulate intersection
      const mockEntry: IntersectionObserverEntry = {
        isIntersecting: true,
        intersectionRatio: 1,
        intersectionRect: new DOMRect(),
        boundingClientRect: new DOMRect(),
        rootBounds: new DOMRect(),
        target: mockElement,
        time: Date.now()
      };

      act(() => {
        observerCallback!([mockEntry]);
      });

      expect(result.current.isIntersecting).toBe(true);
      expect(result.current.entry).toBe(mockEntry);
    });

    it('should handle leaving intersection', () => {
      const mockElement = document.createElement('div');
      let observerCallback: (entries: IntersectionObserverEntry[]) => void;

      MockIntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect
        };
      });

      const { result } = renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref);
      });

      // First intersecting
      const intersectingEntry: IntersectionObserverEntry = {
        isIntersecting: true,
        intersectionRatio: 1,
        intersectionRect: new DOMRect(),
        boundingClientRect: new DOMRect(),
        rootBounds: new DOMRect(),
        target: mockElement,
        time: Date.now()
      };

      act(() => {
        observerCallback!([intersectingEntry]);
      });

      expect(result.current.isIntersecting).toBe(true);

      // Then not intersecting
      const notIntersectingEntry: IntersectionObserverEntry = {
        isIntersecting: false,
        intersectionRatio: 0,
        intersectionRect: new DOMRect(),
        boundingClientRect: new DOMRect(),
        rootBounds: new DOMRect(),
        target: mockElement,
        time: Date.now()
      };

      act(() => {
        observerCallback!([notIntersectingEntry]);
      });

      expect(result.current.isIntersecting).toBe(false);
      expect(result.current.entry).toBe(notIntersectingEntry);
    });
  });

  describe('Options Configuration', () => {
    it('should use custom threshold', () => {
      const mockElement = document.createElement('div');

      renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref, { threshold: 0.5 });
      });

      expect(MockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.5,
          root: null,
          rootMargin: '0px'
        }
      );
    });

    it('should use custom root margin', () => {
      const mockElement = document.createElement('div');

      renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref, { rootMargin: '10px' });
      });

      expect(MockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0,
          root: null,
          rootMargin: '10px'
        }
      );
    });

    it('should use custom root element', () => {
      const mockElement = document.createElement('div');
      const mockRoot = document.createElement('div');

      renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref, { root: mockRoot });
      });

      expect(MockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0,
          root: mockRoot,
          rootMargin: '0px'
        }
      );
    });

    it('should use multiple thresholds', () => {
      const mockElement = document.createElement('div');

      renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      });

      expect(MockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          root: null,
          rootMargin: '0px'
        }
      );
    });
  });

  describe('Cleanup', () => {
    it('should unobserve element on unmount', () => {
      const mockElement = document.createElement('div');

      const { unmount } = renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref);
      });

      expect(mockObserve).toHaveBeenCalledWith(mockElement);

      unmount();

      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });

    it('should unobserve old element when ref changes', () => {
      const mockElement1 = document.createElement('div');
      const mockElement2 = document.createElement('div');

      const { rerender } = renderHook(
        ({ element }) => {
          const ref = { current: element };
          return useIntersectionObserver(ref);
        },
        { initialProps: { element: mockElement1 } }
      );

      expect(mockObserve).toHaveBeenCalledWith(mockElement1);

      rerender({ element: mockElement2 });

      expect(mockUnobserve).toHaveBeenCalledWith(mockElement1);
      expect(mockObserve).toHaveBeenCalledWith(mockElement2);
    });

    it('should handle element becoming null', () => {
      const mockElement = document.createElement('div');

      const { rerender } = renderHook(
        ({ element }) => {
          const ref = { current: element };
          return useIntersectionObserver(ref);
        },
        { initialProps: { element: mockElement } }
      );

      expect(mockObserve).toHaveBeenCalledWith(mockElement);

      rerender({ element: null });

      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('Options Changes', () => {
    it('should recreate observer when options change', () => {
      const mockElement = document.createElement('div');

      const { rerender } = renderHook(
        ({ threshold }) => {
          const ref = { current: mockElement };
          return useIntersectionObserver(ref, { threshold });
        },
        { initialProps: { threshold: 0 } }
      );

      expect(MockIntersectionObserver).toHaveBeenCalledTimes(1);
      expect(mockObserve).toHaveBeenCalledTimes(1);

      rerender({ threshold: 0.5 });

      expect(MockIntersectionObserver).toHaveBeenCalledTimes(2);
      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
      expect(mockObserve).toHaveBeenCalledTimes(2);
    });

    it('should recreate observer when root changes', () => {
      const mockElement = document.createElement('div');
      const mockRoot1 = document.createElement('div');
      const mockRoot2 = document.createElement('div');

      const { rerender } = renderHook(
        ({ root }) => {
          const ref = { current: mockElement };
          return useIntersectionObserver(ref, { root });
        },
        { initialProps: { root: mockRoot1 } }
      );

      expect(MockIntersectionObserver).toHaveBeenCalledTimes(1);

      rerender({ root: mockRoot2 });

      expect(MockIntersectionObserver).toHaveBeenCalledTimes(2);
      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });

    it('should recreate observer when rootMargin changes', () => {
      const mockElement = document.createElement('div');

      const { rerender } = renderHook(
        ({ rootMargin }) => {
          const ref = { current: mockElement };
          return useIntersectionObserver(ref, { rootMargin });
        },
        { initialProps: { rootMargin: '0px' } }
      );

      expect(MockIntersectionObserver).toHaveBeenCalledTimes(1);

      rerender({ rootMargin: '10px' });

      expect(MockIntersectionObserver).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple entries gracefully', () => {
      const mockElement = document.createElement('div');
      let observerCallback: (entries: IntersectionObserverEntry[]) => void;

      MockIntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect
        };
      });

      const { result } = renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref);
      });

      const entry1: IntersectionObserverEntry = {
        isIntersecting: true,
        intersectionRatio: 1,
        intersectionRect: new DOMRect(),
        boundingClientRect: new DOMRect(),
        rootBounds: new DOMRect(),
        target: mockElement,
        time: Date.now()
      };

      const entry2: IntersectionObserverEntry = {
        isIntersecting: false,
        intersectionRatio: 0,
        intersectionRect: new DOMRect(),
        boundingClientRect: new DOMRect(),
        rootBounds: new DOMRect(),
        target: mockElement,
        time: Date.now()
      };

      // Should only use the first entry
      act(() => {
        observerCallback!([entry1, entry2]);
      });

      expect(result.current.isIntersecting).toBe(true);
      expect(result.current.entry).toBe(entry1);
    });

    it('should handle empty entries array', () => {
      const mockElement = document.createElement('div');
      let observerCallback: (entries: IntersectionObserverEntry[]) => void;

      MockIntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect
        };
      });

      const { result } = renderHook(() => {
        const ref = { current: mockElement };
        return useIntersectionObserver(ref);
      });

      // Should not crash with empty array
      act(() => {
        observerCallback!([]);
      });

      expect(result.current.isIntersecting).toBe(false);
      expect(result.current.entry).toBe(null);
    });
  });
});