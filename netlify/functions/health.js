export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      ok: true,
      method: event.httpMethod,
      now: new Date().toISOString(),
    }),
  };
};
