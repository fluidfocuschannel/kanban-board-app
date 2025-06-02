import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Colors */
    --primary-color: #2196f3;
    --primary-dark: #1976d2;
    --primary-light: #bbdefb;
    --success-color: #4caf50;
    --warning-color: #ff9800;
    --error-color: #f44336;
    --background-color: #f5f5f5;
    --card-background: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e1e4e8;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* Breakpoints */
    --bp-tablet: 768px;
    --bp-mobile: 480px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html {
    box-sizing: border-box;
    font-size: 16px;
    height: 100%;
    overflow: hidden;

    @media (max-width: 768px) {
      font-size: 14px;
    }
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  body {
    font-family: 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--background-color);
    color: var(--text-primary);
    line-height: 1.6;
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
  }

  ::selection {
    background: var(--primary-light);
    color: var(--text-primary);
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
