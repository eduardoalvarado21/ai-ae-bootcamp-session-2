// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { act } from 'react';

// user-event resolves a separate @testing-library/dom copy from React Testing Library's,
// so the act() wrappers that RTL installs on its own copy are repeated here.
configure({
  eventWrapper: (callback) => {
    const previous = window.IS_REACT_ACT_ENVIRONMENT;
    window.IS_REACT_ACT_ENVIRONMENT = true;
    try {
      let result;
      act(() => {
        result = callback();
      });
      return result;
    } finally {
      window.IS_REACT_ACT_ENVIRONMENT = previous;
    }
  },
  asyncWrapper: async (callback) => {
    const previous = window.IS_REACT_ACT_ENVIRONMENT;
    window.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      return await callback();
    } finally {
      window.IS_REACT_ACT_ENVIRONMENT = previous;
    }
  },
});
