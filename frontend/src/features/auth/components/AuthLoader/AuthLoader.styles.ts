import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
`;

const skeletonBackground = `linear-gradient(90deg, #edf2fb 25%, #dfe8f8 37%, #edf2fb 63%)`;

export const LoaderWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f8ff 0%, #e7eefc 45%, #dfe7fa 100%);
`;

export const LoaderCard = styled.div`
  width: min(24rem, 92%);
  border-radius: 0.875rem;
  border: 1px solid #d3ddf0;
  background: rgba(255, 255, 255, 0.92);
  padding: 1.25rem;
  box-shadow: 0 0.75rem 1.5rem rgba(24, 42, 78, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

export const SkeletonLine = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width ?? '100%'};
  height: ${({ $height }) => $height ?? '0.9rem'};
  border-radius: 0.5rem;
  background: ${skeletonBackground};
  background-size: 200% 100%;
  animation: ${shimmer} 1.15s linear infinite;
`;

export const SkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const SkeletonCircle = styled.div`
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  background: ${skeletonBackground};
  background-size: 200% 100%;
  animation: ${shimmer} 1.15s linear infinite;
`;
