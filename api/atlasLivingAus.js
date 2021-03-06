const axios = require('axios');

function validateResponse(response, taxonomy) {
  const validSpecie = response.filter((specie) => {
    const resultScientificName = specie.scientificName
      ? specie.scientificName.toLowerCase()
      : undefined;
    const specieScientificName = taxonomy.scientificName
      ? taxonomy.scientificName.toLowerCase()
      : undefined;
    const resultCommonName = specie.commonNameSingle
      ? specie.commonNameSingle.toLowerCase()
      : undefined;
    const specieCommonName = taxonomy.commonName
      ? taxonomy.commonName.toLowerCase()
      : undefined;
    const scientificNameMatch = resultScientificName === specieScientificName;
    const commonNameMatch = resultCommonName !== undefined || specieCommonName !== undefined
      ? resultCommonName === specieCommonName
      : null;
    // console.log(resultScientificName, specieScientificName, resultCommonName, specieCommonName);
    return scientificNameMatch || commonNameMatch;
  });
  return validSpecie.length
    ? validSpecie
    : false;
}

function fetchALASpecies(taxonomy) {
  return axios.get('https://bie.ala.org.au/ws/search.json', {
    params: {
      q: taxonomy.scientificName,
    },
  }).catch(error => console.log(error));
}
const searchALASpecies = async (taxonomy) => {
  const response = await fetchALASpecies(taxonomy);
  const specieData = validateResponse(response.data.searchResults.results, taxonomy);
  // console.log(specieData);
  if (!specieData.length) return false;
  const httpRegexp = /http:\/\//;
  const images = specieData.reduce((acc, specie) => {
    if (specie.imageUrl) {
      const image = {
        url: specie.largeImageUrl.replace(httpRegexp, 'https://'),
        // author: specie.author,
        // specie: specie.scientificName,
        source: 'Atlas of Living Australia',
      };
      acc.push(image);
    }
    return acc;
  }, []);
  return {
    source: 'Atlas of Living Australia',
    images,
  };
};

module.exports = searchALASpecies;
