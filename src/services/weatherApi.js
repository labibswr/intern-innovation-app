export async function fetchActiveAlerts(location = 'Toronto, ON') {
  const mockedAlerts = [
    {
      id: 'weather-001',
      title: 'Severe Rainstorm Approaching',
      level: 'High',
      summary: 'Heavy rain and localized flooding are expected in your area today.',
      details:
        'Strong wind and rainfall may create difficult conditions. Check roof drains, secure exterior items, and avoid low-lying areas.',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockedAlerts), 400);
  });
}
