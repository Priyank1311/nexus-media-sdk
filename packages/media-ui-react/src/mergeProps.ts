import type { PropGetterResult, UserProps } from './types';

// helper to combine ref functions
function mergeRefs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...refs: (React.Ref<any> | undefined)[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.RefCallback<any> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref != null && typeof ref === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ref as React.MutableRefObject<any>).current = node;
      }
    }
  };
}

// merges internal component props with custom user props
export function mergeProps(
  internalProps: PropGetterResult,
  userProps?: UserProps,
): PropGetterResult {
  if (!userProps) return internalProps;

  const merged: Record<string, unknown> = { ...internalProps };

  for (const [key, userValue] of Object.entries(userProps)) {
    const internalValue = (internalProps as Record<string, unknown>)[key];

    if (key === 'ref') {
      merged.ref = mergeRefs(
        internalValue as React.Ref<unknown> | undefined,
        userValue as React.Ref<unknown>,
      );
    } else if (key === 'className') {
      merged.className = [internalValue, userValue]
        .filter(Boolean)
        .join(' ');
    } else if (key === 'style') {
      merged.style = {
        ...(internalValue as React.CSSProperties | undefined),
        ...(userValue as React.CSSProperties),
      };
    } else if (
      typeof userValue === 'function' &&
      typeof internalValue === 'function'
    ) {
      merged[key] = (...args: unknown[]) => {
        (internalValue as (...a: unknown[]) => void)(...args);
        (userValue as (...a: unknown[]) => void)(...args);
      };
    } else {
      merged[key] = userValue;
    }
  }

  return merged as PropGetterResult;
}
