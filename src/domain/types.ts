// Types for optional fields in updates
// undefined = field not provided (don't update)
// null = explicitly set to null (for optional fields)
// T = update to this value
export type OptionalOrUnset<T> = T | null | undefined;
export type RequiredOrUnset<T> = T | undefined;
