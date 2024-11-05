import {
  MouseSensor as LibMouseSensor,
  KeyboardSensor as LibKeyboardSensor,
  TouchSensor as LibTouchSensor,
  MouseSensorOptions,
  Activators,
  KeyboardSensorOptions,
  KeyboardCodes,
  KeyboardCode,
  TouchSensorOptions,
} from '@dnd-kit/core';

enum MouseButton {
  RightClick = 2,
}

export class MouseSensor extends LibMouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: (
        { nativeEvent: event }: React.MouseEvent,
        { onActivation }: MouseSensorOptions
      ) => {
        if (event.button === MouseButton.RightClick) {
          return false;
        }

        onActivation?.({ event });

        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

const defaultKeyboardCodes: KeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter],
};

export class KeyboardSensor extends LibKeyboardSensor {
  static activators: Activators<KeyboardSensorOptions> = [
    {
      eventName: 'onKeyDown' as const,
      handler: (
        event: React.KeyboardEvent,
        { keyboardCodes = defaultKeyboardCodes, onActivation },
        { active }
      ) => {
        const { code } = event.nativeEvent;

        if (keyboardCodes.start.includes(code)) {
          const activator = active.activatorNode.current;

          if (activator && event.target !== activator) {
            return false;
          }

          event.preventDefault();

          onActivation?.({ event: event.nativeEvent });

          return shouldHandleEvent(active.node.current);
        }

        return false;
      },
    },
  ];
}

export class TouchSensor extends LibTouchSensor {
  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: (
        { nativeEvent: event }: React.TouchEvent,
        { onActivation }: TouchSensorOptions
      ) => {
        const { touches } = event;

        if (touches.length > 1) {
          return false;
        }

        onActivation?.({ event });

        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

// Prevent dragging if the user attempts to drag an element with the data attribute data-no-dnd='true'
// Useful for preventing buttons from dragging on click
function shouldHandleEvent(element: HTMLElement | null) {
  let cur = element;

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false;
    }
    cur = cur.parentElement;
  }

  return true;
}
