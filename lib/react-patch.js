import * as ReactOriginal from '../node_modules/react';

export * from '../node_modules/react';

export const useEffectEvent = ReactOriginal.useEffectEvent || ReactOriginal.experimental_useEffectEvent || function(cb) {
  const ref = ReactOriginal.useRef(cb);
  ReactOriginal.useInsertionEffect(() => {
    ref.current = cb;
  });
  return ReactOriginal.useCallback((...args) => {
    return ref.current(...args);
  }, []);
};

export default ReactOriginal.default || ReactOriginal;
