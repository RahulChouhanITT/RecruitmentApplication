export const panelMotion = `
  @keyframes fadeUpChatPanel {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const chatPanelHeight = 'min(720px, calc(100dvh - 72px))';
