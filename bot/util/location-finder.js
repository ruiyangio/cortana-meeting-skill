let locations = {
    RED_ROBBINS: {
        DisplayName: 'Red Robin Gourmet Burgers',
        LocationUri:
            'https://www.bingapis.com/api/v6/localbusinesses/YN925x189752763',
        LocationType: 'LocalBusiness',
        UniqueId:
            'https://www.bingapis.com/api/v6/localbusinesses/YN925x189752763',
        UniqueIdType: 'Bing',
        Address: {
            Type: 'Unknown',
            Street: '7597 170th Ave NE',
            City: 'Redmond',
            State: 'WA',
            CountryOrRegion: 'United States',
            PostalCode: ''
        },
        Coordinates: {
            Latitude: 47.6701,
            Longitude: -122.114
        }
    },
    'starbucks seattle': {
        DisplayName: 'Starbucks',
        LocationUri:
            'https://www.bingapis.com/api/v6/localbusinesses/YN873x115373055',
        LocationType: 'LocalBusiness',
        UniqueId:
            'https://www.bingapis.com/api/v6/localbusinesses/YN873x115373055',
        UniqueIdType: 'Bing',
        Address: {
            Type: 'Unknown',
            Street: '102 Pike St',
            City: 'Seattle',
            State: 'WA',
            CountryOrRegion: 'US',
            PostalCode: '98101'
        },
        Coordinates: {
            Latitude: 47.609054565429687,
            Longitude: -122.33991241455078
        }
    },
    'microsoft building 31': {
        DisplayName: 'Microsoft Corporate Main Campus Building 31',
        LocationUri:
            'https://www.bingapis.com/api/v6/localbusinesses/YN873x1679083988171688647',
        LocationType: 'LocalBusiness',
        UniqueId:
            'https://www.bingapis.com/api/v6/localbusinesses/YN873x1679083988171688647',
        UniqueIdType: 'Bing',
        Address: {
            Type: 'Unknown',
            Street: '3730 163rd Ave NE',
            City: 'Redmond',
            State: 'WA',
            CountryOrRegion: 'US',
            PostalCode: '98052'
        },
        Coordinates: {
            Latitude: 47.643669128417969,
            Longitude: -122.1224365234375
        }
    }
};

function getLocations() {
    return locations;
}

module.exports = {
    getLocations: getLocations
};
