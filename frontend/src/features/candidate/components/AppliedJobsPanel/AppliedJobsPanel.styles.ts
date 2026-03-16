import styled from "styled-components";

export const AppliedJobsWrap = styled.div`
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
`;

export const AppliedJobCard = styled.article`
  position: relative;
  border: 1px solid #dbe3ee;
  border-radius: 0.75rem;
  background: #fff;
  padding: 1rem;
  display: grid;
  gap: 0.55rem;
`;

export const CardStatus = styled.div`
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
`;

export const AppliedTitle = styled.h4`
  margin: 0;
  padding-right: 8.5rem;
  font-size: 1rem;
  color: #0f172a;
  text-transform: capitalize;
`;

export const AppliedMeta = styled.span`
  color: #5a6c86;
  font-size: 0.8rem;
`;

export const AppliedDescription = styled.p`
  margin: 0;
  color: #34465f;
  font-size: 0.84rem;
  line-height: 1.4;
`;
