RUXT Dashboard Backend

# API
## POST /search  
{ "origin": "google" }  
Retuns all origins matching the query present in the current dataset. 

### Result
```
[
    {
        "origin": "http://www.google.hr"
    },
    {
        "origin": "https://images.google.es"
    },
    {
        "origin": "http://googletuki.jyu.fi"
    },
    {
        "origin": "https://www.google.com.bo"
    }
]
```

## POST /content
{ 
    "origin": "https://www.google.com",
    "connection": "3G",
    "device": "phone"
}

Returns the probability of First Contentful Paint and onload finishing before 1sec, 2sec ... 10 sec
### Result
```
{
    "bam": {
        "fcp": {
            "1": 0.6461538461538455,
            "2": 0.827692307692307,
            "3": 0.8923076923076917,
            "4": 0.9230769230769225,
            "5": 0.941538461538461,
            "6": 0.9538461538461532,
            "7": 0.9630769230769225,
            "8": 0.9692307692307688,
            "9": 0.9753846153846152,
            "10": 0.9815384615384615
        },
        "onload": {
            "1": 0.24827586206896546,
            "2": 0.4999999999999999,
            "3": 0.6310344827586205,
            "4": 0.7034482758620688,
            "5": 0.7586206896551723,
            "6": 0.7965517241379308,
            "7": 0.8275862068965516,
            "8": 0.8551724137931034,
            "9": 0.8758620689655173,
            "10": 0.8931034482758622
        }
    }
}
```


To run, you would need [node](https://nodejs.org/en/) and [Docker](http://docker.io/) installed. 

Download your google credentials and point to it, see -  https://cloud.google.com/docs/authentication/getting-started
```
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/the/json/file
```

To run in development mode

```bash
docker-compose up # in one terminal
npm install # in another terminal
npm run watch
```

To start in production mode (set env variables properly)
```bash
export NODE_ENV=production
export GOOGLE_APPLICATION_CREDENTIALS=~/crux-dashboard-backend/crux-gcloud.json
npm run build
npm start # pm2 reloadall
```