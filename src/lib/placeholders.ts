/** Content authors mark not-yet-real fields with the literal substring
 *  "[TODO". Section components filter on this to hide empty cards. */
const TODO_MARKER = '[TODO';

export function isPlaceholderString(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.includes(TODO_MARKER);
}
