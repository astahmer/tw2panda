export const stat = (path: string) => {
  return {
    isFile: () => true,
  };
};

export const statSync = (path: string) => {
  return {
    isFile: () => true,
  };
};

export const readdirSync = (path: string) => {
  return [];
};

export const readdir = (path: string) => {
  return [];
};

export const fs = {
  readFileSync: (path: string) => {
    return "";
  },
};

export default fs;
