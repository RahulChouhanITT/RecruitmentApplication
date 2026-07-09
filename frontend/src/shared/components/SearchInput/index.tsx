import type { InputHTMLAttributes } from 'react';
import { FiSearch } from 'react-icons/fi';
import styled from 'styled-components';

const SearchField = styled.label`
  border: 1px solid #d6dfef;
  background: #ffffff;
  color: #6a7890;
  border-radius: 0.6rem;
  min-height: 2.15rem;
  padding: 0.38rem 0.62rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: auto;
  min-width: 250px;
  flex: 1;

  @media (max-width: 760px) {
    width: 100%;
    justify-self: stretch;
  }

  input {
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 0.8rem;
    color: #2b3e58;
    width: 100%;
  }

  &:focus-within {
    border-color: #000000;
  }
`;

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export const SearchInput = ({ wrapperClassName, ...props }: SearchInputProps) => {
  return (
    <SearchField className={wrapperClassName}>
      <FiSearch size={15} />
      <input type="text" {...props} />
    </SearchField>
  );
};
