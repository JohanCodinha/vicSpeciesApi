const axios = require('axios');

function validateResponse (response, taxonomy) {
  const validSpecie = response.data.find((specie) => {
    const resultScientificName = specie.taxonomy.taxonName
      ? specie.taxonomy.taxonName.toLowerCase()
      : undefined;
    const specieScientificName = taxonomy.scientificName
      ? taxonomy.scientificName.toLowerCase()
      : undefined;
    const specieCommonName = taxonomy.commonName
      ? taxonomy.commonName.toLowerCase()
      : undefined;
    const resultCommonName = specie.taxonomy.commonName
    ? specie.taxonomy.commonName.toLowerCase()
    : undefined;
    const scientificNameMatch = resultScientificName === specieScientificName;
    const commonNameMatch = resultCommonName !== undefined || specieCommonName !== undefined
      ? resultCommonName === specieCommonName
      : null;
    return scientificNameMatch || commonNameMatch;
  });
  return validSpecie || false;
}

function fetchMuseumSpecies (taxonomy) {
  return axios.get('https://collections.museumvictoria.com.au/api/search', {
    params: {
      query: taxonomy.scientificName,
      recordtype: 'species',
    },
  }).catch(error => console.log(error));
}

const searchMuseumSpecies = async (taxonomy) => {
  const response = await fetchMuseumSpecies(taxonomy);
  const specie = validateResponse(response, taxonomy);
  if (!specie) return false;
  // console.log(specie);
  const specieData = {
    distribution: specie.distribution,
    habitat: specie.habitat,
    biology: specie.biology,
    generalDescription: specie.generalDescription,
    images: specie.media.slice(0, specie.media.length - 1).map((media) => {
      const image = {
        alternativeText: media.alternativeText,
        url: media.large
          ? media.large.uri
          : null,
        caption: media.caption,
        creator: media.creators[0],
        source: media.sources[0],
        licence: media.licence.shortName || media.licence.name || null,
      };
      return image;
    }).filter(image => image.url !== null),
  };
  return specieData;
};

module.exports = searchMuseumSpecies;
