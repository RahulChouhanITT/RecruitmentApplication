import {
  Children,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiChevronDown } from 'react-icons/fi';
import styled, { css } from 'styled-components';

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  $pill?: boolean;
  $hasError?: boolean;
};

const HiddenNativeSelect = styled.select`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const SelectRoot = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.button<{ $pill?: boolean; $hasError?: boolean; $open?: boolean }>`
  width: 100%;
  min-height: ${({ $pill }) => ($pill ? '2rem' : '2.5rem')};
  border: 1px solid
    ${({ theme, $hasError, $open }) =>
      $hasError ? theme.colors.danger : $open ? theme.colors.inputFocus : theme.colors.inputBorder};
  border-radius: ${({ theme, $pill }) => ($pill ? theme.radius.pill : '0.5rem')};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ $pill }) => ($pill ? '0.38rem 2.2rem 0.38rem 0.8rem' : '0.625rem 2.4rem 0.625rem 0.75rem')};
  font-size: ${({ $pill }) => ($pill ? '0.78rem' : '0.95rem')};
  font-weight: ${({ $pill }) => ($pill ? 600 : 400)};
  line-height: 1.25;
  text-align: left;
  cursor: pointer;
  outline: none;
  position: relative;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;

  ${({ theme, $open }) =>
    $open
      ? css`
          box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
        `
      : null}

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const TriggerText = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TriggerIcon = styled.span<{ $open?: boolean }>`
  position: absolute;
  top: 50%;
  right: 0.78rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%) rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 120ms ease;
  pointer-events: none;
`;

const OptionMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  z-index: 3000;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 0.7rem;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.floating};
  padding: 0.3rem;
  display: grid;
  gap: 0.2rem;
  max-height: 15rem;
  overflow-y: auto;
`;

const OptionButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: none;
  border-radius: 0.5rem;
  background: ${({ theme, $active }) => ($active ? theme.colors.primaryLight : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textPrimary)};
  padding: 0.55rem 0.7rem;
  text-align: left;
  font-size: 0.86rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.primaryLight : theme.colors.hoverBg)};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const getOptionLabel = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getOptionLabel).join('');
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    return getOptionLabel(element.props.children);
  }

  return '';
};

const toOptions = (children: ReactNode): SelectOption[] =>
  Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    const optionElement = child as ReactElement<{ value?: string; disabled?: boolean; children?: ReactNode }>;
    if (optionElement.type !== 'option') {
      return [];
    }

    return [
      {
        value: String(optionElement.props.value ?? ''),
        label: getOptionLabel(optionElement.props.children),
        disabled: optionElement.props.disabled,
      },
    ];
  });

export const Select = ({
  id,
  name,
  value,
  onChange,
  children,
  className,
  disabled = false,
  required = false,
  'aria-label': ariaLabel,
  $pill = false,
  $hasError = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(() => toOptions(children), [children]);
  const selectedOption =
    options.find((option) => option.value === value) ??
    options.find((option) => option.value === '') ??
    null;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [children, value]);

  const emitChange = (nextValue: string) => {
    if (!onChange) {
      return;
    }

    onChange({
      target: { value: nextValue, name: name ?? '', id: id ?? '' },
      currentTarget: { value: nextValue, name: name ?? '', id: id ?? '' },
    } as ChangeEvent<HTMLSelectElement>);
  };

  return (
    <SelectRoot ref={rootRef} className={className}>
      <HiddenNativeSelect id={id} name={name} value={value} required={required} disabled={disabled}>
        {children}
      </HiddenNativeSelect>
      <SelectTrigger
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={disabled}
        $pill={$pill}
        $hasError={$hasError}
        $open={isOpen}
      >
        <TriggerText>{selectedOption?.label ?? ''}</TriggerText>
        <TriggerIcon $open={isOpen}>
          <FiChevronDown size={$pill ? 15 : 17} />
        </TriggerIcon>
      </SelectTrigger>
      {isOpen ? (
        <OptionMenu role="listbox">
          {options.map((option) => (
            <OptionButton
              key={`${name ?? id ?? 'select'}-${option.value}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              $active={option.value === value}
              onClick={() => {
                if (option.disabled) {
                  return;
                }

                emitChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </OptionButton>
          ))}
        </OptionMenu>
      ) : null}
    </SelectRoot>
  );
};
