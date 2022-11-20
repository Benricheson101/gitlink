export const errorResponse = (
  reason: string,
  other: Record<string, unknown> = {}
) => ({
  reason,
  ...other,
});

export const successResponse = <T>(data: T) => ({
  ...data,
});
