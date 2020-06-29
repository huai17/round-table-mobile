let _debug = 'remote';

export const getSeverAddress = (options = {}) => {
  const {debug = _debug, server, local, remote} = options;

  return process.env.NODE_ENV === 'production'
    ? server
    : debug === 'local'
    ? local
    : remote;
};
