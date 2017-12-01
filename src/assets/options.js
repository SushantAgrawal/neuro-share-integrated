var gUrlMaps = {
    //"http:get:medications": "https://private-242c4d-ehr2.apiary-mock.com/maestro/api/ehr/medications-orders/",
    "http:get:medications": "http://10.10.1.33:3000/medications-orders/",
    "http:get:edss": "https://private-anon-38e9a00da6-neuroshareapis.apiary-mock.com/neuroshare/api/ms/edss-score/",
    "http:get:cds:info": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds-info/",

    "http:get:cds:user:data": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds/",
    "http:put:cds:user:data": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds/",
    "http:post:cds:user:data": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds/",

    "http:get:dmt": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/dmt/",

    "http:get:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",
    "http:put:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",
    "http:post:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",
    "http:delete:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",

    "http:get:all:questionnaire": "https://private-anon-38e9a00da6-neuroshareapis.apiary-mock.com/neuroshare/api/all-questionnaire-responses/",
    "http:get:otherMeds": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/other-meds/",
    "http:get:imaging": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/imaging-orders/",
    "http:get:labs": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/lab-orders/",
    "http:get:virtualCaseLoad": "https://private-anon-38e9a00da6-neuroshareapis.apiary-mock.com/neuroshare/api/ms/ms-population-data/",
    "http:get:walk25Feet": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/25walk/",
    "http:get:walk25Feet:info": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/25walk-info/",
    "http:get:referenceLine": "https://private-242c4d-ehr2.apiary-mock.com/maestro/api/ehr/encounters/",
    "http:get:progressNote": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/progress-note/"
};

//To be removed later
var gUrlMaps_temp = {
    "http:get:medications": "http://10.10.1.33:3000/medications-orders/", //Response does not match with mock!!
    //"http:get:edss": "http://10.10.1.33:3000/edss-score/", //Response does not match with mock!!
    "http:get:edss": "https://private-anon-38e9a00da6-neuroshareapis.apiary-mock.com/neuroshare/api/ms/edss-score/", //Response does not match with mock!!
    "http:get:cds:info": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds-info/",//NA.

    //"http:get:cds:user:data": "http://10.10.1.33:3000/cds/",//Response does not match with mock!!
    "http:get:cds:user:data": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds/",//Response does not match with mock!!
    "http:put:cds:user:data": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds/",//Response does not match with mock!!
    "http:post:cds:user:data": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/cds/",//Response does not match with mock!!

    "http:get:dmt": "http://10.10.1.33:3000/dmt/",

    "http:get:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",//NA.
    "http:put:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",//NA.
    "http:post:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",//NA.
    "http:delete:relapse": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/relapses/",//NA.

    "http:get:all:questionnaire": "https://private-anon-38e9a00da6-neuroshareapis.apiary-mock.com/neuroshare/api/all-questionnaire-responses/",//NA.
    "http:get:otherMeds": "http://10.10.1.33:3000/other-meds/",
    "http:get:imaging": "http://10.10.1.33:3000/imaging-orders/",
    "http:get:labs": "http://10.10.1.71:8081/neuroshare/api/internal/ms/lab-orders",//https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/lab-orders/",//Response does not match with mock!!
    "http:get:virtualCaseLoad": "http://10.10.1.33:3000/ms-population-data/",
    "http:get:walk25Feet": "http://10.10.1.33:3000/25walk/",
    "http:get:walk25Feet:info": "http://10.10.1.33:3000/25walk-info/",
    "http:get:referenceLine": "https://private-242c4d-ehr2.apiary-mock.com/maestro/api/ehr/encounters/", //NA.
    "http:get:progressNote": "https://private-anon-7ea2a62b33-neuroshareapis.apiary-mock.com/neuroshare/api/ms/progress-note/"//NA.
};