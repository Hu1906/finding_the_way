export async function findPath(start, end) {
  const response = await fetch('api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startlat: start.lat,
      startlon: start.lng,
      goallat: end.lat,
      goallon: end.lng,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || 'Không thể tìm đường');
  }

  return response.json();
}
