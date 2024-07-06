export const log = (...args: any[]) => console.log(...args);
export const error = (...args: any[]) => console.error(...args);

export const isObjEmpty = (objectName: any) => {
  return Object.keys(objectName).length === 0;
};

export const castToArray = (obj: any) => {
  return Object.keys(obj).map((key) => obj[key]);
};
