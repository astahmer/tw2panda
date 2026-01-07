import { css } from '@panda-css/core';

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  backgroundColor: 'blue.600',
  color: 'white',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 200ms',
  _hover: {
    backgroundColor: 'blue.700',
    transform: 'translateY(-2px)',
  },
  _active: {
    backgroundColor: 'blue.800',
  },
});

export default buttonStyles;
