import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('renders animated letters, tracks the pointer, resizes, and cancels animation on unmount', () => {
  const context = {
    clearRect: vi.fn(), save: vi.fn(), beginPath: vi.fn(), translate: vi.fn(),
    rotate: vi.fn(), fillText: vi.fn(), closePath: vi.fn(), restore: vi.fn(),
    arc: vi.fn(), stroke: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  let frame: FrameRequestCallback | undefined;
  let frameId = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    frame = callback;
    return ++frameId;
  });
  const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  const { container, unmount } = render(<App />);
  const canvas = container.querySelector('canvas')!;
  expect(canvas.width).toBe(window.innerWidth);
  expect(canvas.height).toBe(window.innerHeight);
  act(() => frame!(0));
  expect(context.fillText).toHaveBeenCalledTimes(100);

  fireEvent.mouseEnter(canvas);
  fireEvent.mouseMove(canvas, { clientX: 120, clientY: 90 });
  act(() => frame!(16));
  expect(context.arc).toHaveBeenCalledWith(120, 90, 30, 0, 2 * Math.PI, true);
  context.arc.mockClear();
  fireEvent.mouseLeave(canvas);
  act(() => frame!(32));
  expect(context.arc).not.toHaveBeenCalled();

  vi.stubGlobal('innerWidth', 640);
  vi.stubGlobal('innerHeight', 480);
  fireEvent.resize(window);
  expect(canvas.width).toBe(640);
  expect(canvas.height).toBe(480);
  cancel.mockClear();
  unmount();
  expect(cancel).toHaveBeenCalled();
});
