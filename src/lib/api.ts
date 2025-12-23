export async function apiCall<T>(
  url: string,
  body: object,
  resultField: string | null,
  errorMessage: string
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || errorMessage);
  }

  if (resultField !== null) {
    if (!data?.[resultField]) {
      throw new Error("Invalid response from server");
    }
    return data[resultField];
  }

  return data;
}
