let _uid = 0;

export const uid = () => `u${++_uid}`;
