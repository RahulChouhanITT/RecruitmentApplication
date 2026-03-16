import { FiInbox } from "react-icons/fi";
import type { IconType } from "react-icons";
import { EmptyCard, EmptyDescription, EmptyIcon, EmptyTitle } from "./EmptyStateCard.styles";

type EmptyStateCardProps = {
  title: string;
  description: string;
  icon?: IconType;
};

export const EmptyStateCard = ({ title, description, icon: Icon = FiInbox }: EmptyStateCardProps) => {
  return (
    <EmptyCard>
      <EmptyIcon>
        <Icon size={16} />
      </EmptyIcon>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyCard>
  );
};
