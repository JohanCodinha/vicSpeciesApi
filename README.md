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
