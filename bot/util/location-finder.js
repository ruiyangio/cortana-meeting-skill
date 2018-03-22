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
    }
};

function getLocations() {
    return locations;
}

module.exports = {
    getLocations: getLocations
};
