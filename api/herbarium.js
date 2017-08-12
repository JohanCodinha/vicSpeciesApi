const axios = require('axios');

function validateResponse(response, taxonomy) {
  if (!response) return false;
  const validSpecie = response.data.data.filter((specie) => {
    const resultScientificName = specie.scientificName
      ? specie.scientificName.toLowerCase()
      : undefined;
    const specieScientificName = taxonomy.scientificName
      ? taxonomy.scientificName.toLowerCase()
      : undefined;
    const scientificNameMatch = resultScientificName === specieScientificName;
    return scientificNameMatch;
  });
  return validSpecie || false;
}

function fetchHerbariumSpecies(taxonomy) {
  return axios.get('https://vicflora.rbg.vic.gov.au/api/images', {
    params: {
      'filter[taxonName]': taxonomy.scientificName,
    },
  }).catch(error => console.log(error));
}

async function searchHerbariumSpecies(taxonomy) {
  const response = await fetchHerbariumSpecies(taxonomy);
  const images = validateResponse(response, taxonomy);
  if (!images.length) return false;
  const orderedByHeroImg = images.sort((a, b) => {
    if (a.isHeroImage === true && b.isHeroImage === false) {
      return -1;
    }
    if (b.isHeroImage === true && a.isHeroImage === false) {
      return 1;
    }
    return 0;
  });
  console.log(orderedByHeroImg);
  const specieData = {
    // distribution: specie.distribution,
    // habitat: specie.habitat,
    // biology: specie.biology,
    // generalDescription: specie.generalDescription,
    images: orderedByHeroImg.map((media) => {
      console.log(media);
      return {
        source: 'National Herbarium of Victoria',
        // alternativeText: media.alternativeText,
        medium: media.accessPoints.data
          .find(d => d.variant === 'preview').accessURI,
        thumbnail: media.accessPoints.data
          .find(d => d.variant === 'thumbnail').accessURI,
        // caption: media.caption,
        creator: media.creator,
        // source: media.source || 'Royal Botanic Garden Victoria',
      };
    }),
  };
  return specieData;
}

module.exports = searchHerbariumSpecies;
