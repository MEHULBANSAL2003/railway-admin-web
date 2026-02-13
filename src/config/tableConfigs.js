// Reusable column configurations

export const stationColumns = [
  {
    key: 'stationId',
    label: 'ID',
    className: 'id-column',
  },
  {
    key: 'stationCode',
    label: 'Station Code',
    className: 'code-column',
  },
  {
    key: 'stationName',
    label: 'Station Name',
  },
  {
    key: 'city',
    label: 'City',
  },
  {
    key: 'state',
    label: 'State',
  },
  {
    key: 'zone',
    label: 'Zone',
    render: (value) => value ? value.replace(/_/g, ' ') : '-',
  },
  {
    key: 'numPlatforms',
    label: 'Platforms',
    className: 'text-center',
  },

];

export const trainColumns = [
  {
    key: 'trainNumber',
    label: 'Train Number',
  },
  {
    key: 'trainName',
    label: 'Train Name',
  },
  {
    key: 'source',
    label: 'Source',
  },
  {
    key: 'destination',
    label: 'Destination',
  },
  // ... more columns
];
