export async function findPath(start, end) {
  const response = await fetch('/findpath', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startLat: start.lat,
      startLon: start.lng,
      endLat: end.lat,
      endLon: end.lng,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || 'Không thể tìm đường');
  }

  return response.json();
}
