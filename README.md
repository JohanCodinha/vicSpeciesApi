# Victorian species API

This project provide an API for the official Victorian list of species from the [VBA web-based information system](https://vba.dse.vic.gov.au/).
The taxonomic data is hydrated with content like images and description from different official Australian sources.
[Atlas of LivingAustralia](www.ala.org.au)
[Museums Victoria](https://museumvictoria.com.au)
[National Herbarium of Victoria](https://www.rbg.vic.gov.au/science/herbarium-and-resources/national-herbarium-of-victoria)
## Getting Started

The latest species list can be [downloaded](https://vba.dse.vic.gov.au/vba/downloadVSC.do) as a .csv file from the [VBA](https://vba.dse.vic.gov.au/vba/index.jsp)
The .csv file need to be converted to json, with a tool like csvtojson available on npm.
A running mongoDb instance need to be running.
Run seed.js with node to build the database.
Run hydrate.js to fetch species information and hydrate the database.

## API How To's
```
 https://vbago.science/api
```
### Search for species (autocomplete)

```
 GET /search?query=wombat
```

 Search for species by name, can be filtered by discipline.
 
 Http parameters:
```
 query : The search query
 discipline : Optional with one of those value: fauna | flora | marine | all
```
**Example Request:**

```
https://vbago.science/api/search?query=wombat&discipline=fauna
```

**Success Response:**

```
HTTP/1.1 200 OK
```  
```json
[  
   {  
      "taxonId":528541,
      "taxonType":"Mammals",
      "parentTaxonID":528540,
      "commonName":"Southern Hairy-nosed Wombat",
      "scientificName":"Lasiorhinus latifrons",
      "shortName":null,
      "origin":null,
      "authority":null,
      "conservationStatus":{  
         "vicAdvisory":null,
         "epbcAct":null,
         "ffgAct":null
      },
      "description":null,
      "images":[  
         {  
            "s3Url":"https://vba-species-images.s3-ap-southeast-2.amazonaws.com/71550629c9849bbaf86c748e0a193ebe_528541",
            "s3Name":"71550629c9849bbaf86c748e0a193ebe_528541",
            "source":"Atlas of Living Australia",
            "url":"https://images.ala.org.au/image/proxyImage?imageId=cddc295f-1f61-411f-a9a8-728f6cda31ce"
         }
      ],
      "discipline":{  
         "primary":"Terrestrial fauna",
         "all":[  
            "Terrestrial fauna"
         ]
      },
      "scientificNameSynonyme":[  
         "Lasiorhinus latifrons"
      ],
      "commonNameSynonyme":[  
         "Southern Hairy-nosed Wombats"
      ]
   },
   {  
      "taxonId":11165,
      "taxonType":"Mammals",
      "parentTaxonID":527360,
      "commonName":"Common Wombat",
      "scientificName":"Vombatus ursinus",
      "shortName":null,
      "origin":null,
      "authority":null,
      "conservationStatus":{  
         "vicAdvisory":null,
         "epbcAct":null,
         "ffgAct":null
      },
      "description":{  
         "source":null,
         "distribution":"South-eastern mainland Australia and Tasmania.",
         "habitat":"Dry and wet forest, woodland and coastal heath.",
         "biology":"Common Wombats dig burrows with their sharp claws and powerful short limbs. They have rear-facing pouches to keep them from filling with dirt while digging. In winter, females give birth to a single young. Wombats' teeth grow in response to wear. They are largely nocturnal. They occasionally enter people's tents at campsites looking for food."
      },
      "images":[  
         {  
            "s3Url":"https://vba-species-images.s3-ap-southeast-2.amazonaws.com/f4e28e5f9471a935bc855eb0ee435f81_11165",
            "s3Name":"f4e28e5f9471a935bc855eb0ee435f81_11165",
            "source":"Parks Victoria",
            "url":"https://collections.museumvictoria.com.au/content/media/28/361528-large.jpg"
         },
         {  
            "s3Url":"https://vba-species-images.s3-ap-southeast-2.amazonaws.com/fb3373b8130a5cfbf9ec1764eae27486_11165",
            "s3Name":"fb3373b8130a5cfbf9ec1764eae27486_11165",
            "source":"Gary Lewis",
            "url":"https://collections.museumvictoria.com.au/content/media/33/360433-large.jpg"
         }
      ],
      "discipline":{  
         "primary":"Terrestrial fauna",
         "all":[  
            "Terrestrial fauna"
         ]
      },
      "scientificNameSynonyme":null,
      "commonNameSynonyme":[  
         "Common Wombat"
      ]
   }
]
```
### Prerequisites

```
Give examples
```

### Installing

A step by step series of examples that tell you have to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo


## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [node.js]() - Node.js
* [aws]() - Amazon web services - S3
* [mongodb]() - MongoDb noSql database
 

## Authors

* **Johan Codinha** - *Initial work* -

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
