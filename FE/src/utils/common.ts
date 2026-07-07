export function cn(...args: (string | undefined | false | null)[]): string {
  return args.filter(Boolean).join(" ");
}

let _uid = 0;
export const uid = () => `u${++_uid}`;
