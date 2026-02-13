// Reusable column configurations

export const stationColumns = [
  {
    key: 'stationId',
    label: 'ID',
    className: 'id-column',
    sortable: true,
  },
  {
    key: 'stationCode',
    label: 'Station Code',
    className: 'code-column',
    sortable: true,
  },
  {
    key: 'stationName',
    label: 'Station Name',
    sortable: true,
  },
  {
    key: 'city',
    label: 'City',
    sortable: true,
  },
  {
    key: 'state',
    label: 'State',
    sortable: true,
  },
  {
    key: 'zone',
    label: 'Zone',
    sortable: true,
    render: (value) => value ? value.replace(/_/g, ' ') : '-',
  },
  {
    key: 'junction',
    label: 'Junction',
    className: 'text-center',
    sortable: true,
    render: (value) => (
      <span className={`junction-badge ${value ? 'is-junction' : 'not-junction'}`}>
        {value ? 'Yes' : 'No'}
      </span>
    ),
  },
  {
    key: 'numPlatforms',
    label: 'Platforms',
    className: 'text-center',
    sortable: true,
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
