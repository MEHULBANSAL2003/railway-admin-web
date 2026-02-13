// src/utils/dummyData.js

/**
 * Generate dummy station data with pagination support
 */
export const generateStationData = (page = 0, size = 20) => {
  const allStations = [
    // Major stations
    {
      id: 1,
      stationCode: 'NDLS',
      stationName: 'New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      status: 'Active',
      isUpdatable: true,
      isDeletable: false, // Major station, cannot delete
      createdAt: '2024-01-15T10:30:00',
      platforms: 16
    },
    {
      id: 2,
      stationCode: 'CSMT',
      stationName: 'Chhatrapati Shivaji Maharaj Terminus',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: false,
      createdAt: '2024-01-15T10:30:00',
      platforms: 18
    },
    {
      id: 3,
      stationCode: 'HWH',
      stationName: 'Howrah Junction',
      city: 'Howrah',
      state: 'West Bengal',
      status: 'Active',
      isUpdatable: true,
      isDeletable: false,
      createdAt: '2024-01-16T11:20:00',
      platforms: 23
    },
    {
      id: 4,
      stationCode: 'MAS',
      stationName: 'Chennai Central',
      city: 'Chennai',
      state: 'Tamil Nadu',
      status: 'Active',
      isUpdatable: true,
      isDeletable: false,
      createdAt: '2024-01-16T11:20:00',
      platforms: 12
    },
    {
      id: 5,
      stationCode: 'SBC',
      stationName: 'Bangalore City Junction',
      city: 'Bangalore',
      state: 'Karnataka',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-17T09:15:00',
      platforms: 10
    },
    {
      id: 6,
      stationCode: 'PUNE',
      stationName: 'Pune Junction',
      city: 'Pune',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-17T09:15:00',
      platforms: 6
    },
    {
      id: 7,
      stationCode: 'JP',
      stationName: 'Jaipur Junction',
      city: 'Jaipur',
      state: 'Rajasthan',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-18T14:30:00',
      platforms: 5
    },
    {
      id: 8,
      stationCode: 'ADI',
      stationName: 'Ahmedabad Junction',
      city: 'Ahmedabad',
      state: 'Gujarat',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-18T14:30:00',
      platforms: 12
    },
    {
      id: 9,
      stationCode: 'LKO',
      stationName: 'Lucknow Charbagh',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-19T08:45:00',
      platforms: 8
    },
    {
      id: 10,
      stationCode: 'HYB',
      stationName: 'Hyderabad Deccan',
      city: 'Hyderabad',
      state: 'Telangana',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-19T08:45:00',
      platforms: 7
    },
    // Secondary stations
    {
      id: 11,
      stationCode: 'PNBE',
      stationName: 'Patna Junction',
      city: 'Patna',
      state: 'Bihar',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-20T10:00:00',
      platforms: 10
    },
    {
      id: 12,
      stationCode: 'BPL',
      stationName: 'Bhopal Junction',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-20T10:00:00',
      platforms: 6
    },
    {
      id: 13,
      stationCode: 'VSKP',
      stationName: 'Visakhapatnam Junction',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-21T12:30:00',
      platforms: 8
    },
    {
      id: 14,
      stationCode: 'CBE',
      stationName: 'Coimbatore Junction',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-21T12:30:00',
      platforms: 6
    },
    {
      id: 15,
      stationCode: 'KOAA',
      stationName: 'Kolkata',
      city: 'Kolkata',
      state: 'West Bengal',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-22T09:00:00',
      platforms: 10
    },
    {
      id: 16,
      stationCode: 'GHY',
      stationName: 'Guwahati',
      city: 'Guwahati',
      state: 'Assam',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-22T09:00:00',
      platforms: 5
    },
    {
      id: 17,
      stationCode: 'ERS',
      stationName: 'Ernakulam Junction',
      city: 'Kochi',
      state: 'Kerala',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-23T11:15:00',
      platforms: 7
    },
    {
      id: 18,
      stationCode: 'TVC',
      stationName: 'Trivandrum Central',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-23T11:15:00',
      platforms: 5
    },
    {
      id: 19,
      stationCode: 'INDB',
      stationName: 'Indore Junction',
      city: 'Indore',
      state: 'Madhya Pradesh',
      status: 'Maintenance',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-24T13:45:00',
      platforms: 4
    },
    {
      id: 20,
      stationCode: 'VGLB',
      stationName: 'Virar',
      city: 'Virar',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-24T13:45:00',
      platforms: 4
    },
    // More stations for pagination testing
    {
      id: 21,
      stationCode: 'NZM',
      stationName: 'Hazrat Nizamuddin',
      city: 'New Delhi',
      state: 'Delhi',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-25T10:00:00',
      platforms: 7
    },
    {
      id: 22,
      stationCode: 'BDTS',
      stationName: 'Bandra Terminus',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-25T10:00:00',
      platforms: 8
    },
    {
      id: 23,
      stationCode: 'BCT',
      stationName: 'Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-26T11:30:00',
      platforms: 9
    },
    {
      id: 24,
      stationCode: 'KYN',
      stationName: 'Kalyan Junction',
      city: 'Kalyan',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-26T11:30:00',
      platforms: 8
    },
    {
      id: 25,
      stationCode: 'ST',
      stationName: 'Surat',
      city: 'Surat',
      state: 'Gujarat',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-27T09:45:00',
      platforms: 6
    },
    {
      id: 26,
      stationCode: 'MMCT',
      stationName: 'Mumbai Mahalaxmi',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Inactive',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-27T09:45:00',
      platforms: 2
    },
    {
      id: 27,
      stationCode: 'UDZ',
      stationName: 'Udaipur City',
      city: 'Udaipur',
      state: 'Rajasthan',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-28T12:00:00',
      platforms: 3
    },
    {
      id: 28,
      stationCode: 'CKNI',
      stationName: 'Chhatrapati Shivaji Intl Airport',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-28T12:00:00',
      platforms: 2
    },
    {
      id: 29,
      stationCode: 'AGC',
      stationName: 'Agra Cantt',
      city: 'Agra',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-29T14:15:00',
      platforms: 5
    },
    {
      id: 30,
      stationCode: 'GWL',
      stationName: 'Gwalior Junction',
      city: 'Gwalior',
      state: 'Madhya Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-29T14:15:00',
      platforms: 5
    },
    {
      id: 31,
      stationCode: 'JBP',
      stationName: 'Jabalpur',
      city: 'Jabalpur',
      state: 'Madhya Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-30T10:30:00',
      platforms: 6
    },
    {
      id: 32,
      stationCode: 'ANVT',
      stationName: 'Anand Vihar Terminal',
      city: 'New Delhi',
      state: 'Delhi',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-30T10:30:00',
      platforms: 8
    },
    {
      id: 33,
      stationCode: 'CNB',
      stationName: 'Kanpur Central',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-31T11:45:00',
      platforms: 9
    },
    {
      id: 34,
      stationCode: 'ALD',
      stationName: 'Prayagraj Junction',
      city: 'Prayagraj',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-01-31T11:45:00',
      platforms: 10
    },
    {
      id: 35,
      stationCode: 'DDU',
      stationName: 'Pandit Deen Dayal Upadhyaya Junction',
      city: 'Mughalsarai',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-02-01T09:00:00',
      platforms: 9
    },
    {
      id: 36,
      stationCode: 'BSB',
      stationName: 'Varanasi Junction',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-02-01T09:00:00',
      platforms: 8
    },
    {
      id: 37,
      stationCode: 'MGS',
      stationName: 'Mughal Sarai Junction',
      city: 'Chandauli',
      state: 'Uttar Pradesh',
      status: 'Maintenance',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-02-02T10:15:00',
      platforms: 7
    },
    {
      id: 38,
      stationCode: 'NDBT',
      stationName: 'New Delhi Bridge',
      city: 'New Delhi',
      state: 'Delhi',
      status: 'Inactive',
      isUpdatable: false,
      isDeletable: false,
      createdAt: '2024-02-02T10:15:00',
      platforms: 1
    },
    {
      id: 39,
      stationCode: 'TKD',
      stationName: 'Tuglakabad',
      city: 'New Delhi',
      state: 'Delhi',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-02-03T12:30:00',
      platforms: 4
    },
    {
      id: 40,
      stationCode: 'JDNX',
      stationName: 'Juanda',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      status: 'Active',
      isUpdatable: true,
      isDeletable: true,
      createdAt: '2024-02-03T12:30:00',
      platforms: 2
    },
    // Add more for infinite scroll testing
    ...Array.from({ length: 60 }, (_, i) => ({
      id: 41 + i,
      stationCode: `STN${String(i + 1).padStart(3, '0')}`,
      stationName: `Station ${i + 41}`,
      city: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'][i % 5],
      state: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'][i % 5],
      status: i % 7 === 0 ? 'Maintenance' : i % 13 === 0 ? 'Inactive' : 'Active',
      isUpdatable: true,
      isDeletable: i % 3 !== 0,
      createdAt: new Date(2024, 1, 4 + Math.floor(i / 2)).toISOString(),
      platforms: Math.floor(Math.random() * 10) + 2
    }))
  ];

  // Simulate pagination
  const start = page * size;
  const end = start + size;
  const paginatedData = allStations.slice(start, end);
  const isLast = end >= allStations.length;

  return {
    content: paginatedData,
    totalElements: allStations.length,
    totalPages: Math.ceil(allStations.length / size),
    size: size,
    number: page,
    last: isLast,
    first: page === 0,
    numberOfElements: paginatedData.length,
    empty: paginatedData.length === 0
  };
};

/**
 * Simulate API delay
 */
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock fetch stations with API response structure
 */
export const fetchStationData = async (page = 0) => {
  try {
    // Simulate network delay
    await delay(800);

    const paginatedResponse = generateStationData(page, 20);

    // Match your actual API response structure
    return {
      data: {
        status: 'success',
        message: 'Stations retrieved successfully',
        data: paginatedResponse
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch stations');
  }
};

/**
 * Mock delete station
 */
export const deleteStationData = async (id) => {
  await delay(500);
  console.log(`Deleted station with ID: ${id}`);
  return {
    data: {
      status: 'success',
      message: 'Station deleted successfully'
    }
  };
};
