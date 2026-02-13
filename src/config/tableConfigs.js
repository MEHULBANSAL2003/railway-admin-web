// Reusable column configurations

export const stationColumns = [
  {
    key: 'id',
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
    key: 'status',
    label: 'Status',
    render: (value) => (
      <span className={`status-badge status-${value?.toLowerCase()}`}>
        {value}
      </span>
    ),
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
